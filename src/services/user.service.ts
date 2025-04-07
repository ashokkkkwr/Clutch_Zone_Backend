import {Message} from '../constant/messages';
import HttpException from '../utils/HttpException.utils';
import BcryptService from '../utils/bcryptService';
import {transferImageFromUploadToTemp} from '../utils/path.utils';
import {createToken, verifyToken} from '../utils/tokenManager';
import {DotenvConfig} from '../config/env.config';
import {addMinutes} from 'date-fns';
import {randomInt} from 'crypto';
import { accountActivationMail } from '../utils/mail.template';
import { PrismaClient } from '@prisma/client';
import webTokenService from '../utils/webToken.service';
import {Role} from '../constant/enum';

const prisma=new PrismaClient();


class UserService {
  async register(username: string, email: string, password: string) {
    console.log('🚀 ~ UserService ~ register ~ password:', password);
    console.log('🚀 ~ UserService ~ register ~ email:', email);
    console.log('🚀 ~ UserService ~ register ~ username:', username);

    if (!username) throw HttpException.badRequest(`Fullname is required.`);
    if (!email) throw HttpException.badRequest(`Email is required`);
    if (!password) throw HttpException.badRequest('Password is required');

    const userEmailExists = await prisma.user.findUnique({
      where: {email},
    });
    console.log("🚀 ~ UserService ~ register ~ userEmailExists:", userEmailExists)

    if (userEmailExists) {
      console.log("🚀 ~ UserService ~ register ~ userEmailExists:", userEmailExists)
      throw new Error('You have already registered with this email');
    }

    const hash = await BcryptService.hash(password);
    const user = {
      username,
      email,
      password: hash,
      role: Role.USER, // Assign using the Role enum

    };
    console.log("🚀 ~ UserService ~ register ~ user:", user)

    const save =await prisma.user.create({
      data:{
        email: email,
        username,
        password: hash,
      }
      
    });
    console.log("🚀 ~ UserService ~ register ~ save:", save)
    const otp=await this.generateOtp(email)
    console.log("🚀 ~ UserService ~ register ~ otp:", otp)
    

    accountActivationMail(email,username,otp)
  }
  async generateOtp(email: string): Promise<string> {
    const user = await prisma.user.findFirst({where: {email}});
    console.log("🚀 ~ UserService ~ generateOtp ~ user:", user)
    if (!user) throw HttpException.notFound(`User with email ${email} does not exists.`);
    //Generate a random 6-digit OTP
    const otp = randomInt(100000, 999999).toString();
    const expirationTime = addMinutes(new Date(), 10);

    await prisma.user.update({
      data: {
        otp,
        otpExpiration: expirationTime
      },
      where:{
        id:user.id
      }
    })
    console.log(`Your OTP is: ${otp}. It expires in 10 minutes.`);
    return otp;
  }
  async verifyOtp(otp: string, email: string): Promise<boolean> 
  {
    try{
        console.log('haha')
        const user = await prisma.user.findUnique({where: {email}});
        console.log("🚀 ~ UserService ~ user:", user)
        if (!user) throw HttpException.notFound(`User with email ${email} does not exists.`);
        if (user.otp !== otp) throw HttpException.badRequest(`OTP has expired.`);
        //clear OTP fields after successful verification
        await prisma.user.update({
          data:{
            otpExpiration:null,
            otp:null
          },where:{
            id:user.id
          }
        })
        return true;
    }catch(error){
        console.log("🚀 ~ UserService ~ error:", error)
        return false
    }
   
  }
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    console.log("🚀 ~ UserService ~ login ~ user:", user)
    if (!user) {
        throw HttpException.notFound(`Invalid credentials`);
    }
    const matchPassword = await BcryptService.compare(password, user.password!);
    console.log("🚀 ~ UserService ~ login ~ matchPassword:", matchPassword)
    if (!matchPassword) {
        throw HttpException.notFound(`Invalid credentials`);
    }
    // const token = createToken(
    //     { id: user.id },
    //     process.env.JWT_SECRET,
    //     process.env.BROWSER_COOKIES_EXPIRES_IN
    // );
    const tokenId= Number(user.id)
    console.log("🚀 ~ UserService ~ login ~ tokenId:", tokenId)
    const token = webTokenService.generateTokens(
      {
        id:tokenId.toString()
      },
      user.role as Role
    )
    if(!token) {
      throw new Error('Failed to generate token');
    }
    console.log("🚀 ~ UserService ~ login ~ token:", token)
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      token:token.accessToken,
    };
}
async userDetails(id: string) {
  // Convert the id to a number
  const numericId = Number(id);

  // Validate the numericId
  if (isNaN(numericId)) {
    throw new Error('Invalid ID: ID must be a valid number');
  }

  // Fetch user details
  const userDetails = await prisma.user.findFirst({
    where: {
      id: numericId, // Use the converted number
    },
  });

  return userDetails;
}
async updateBio(id: string, bio: string){
  if(!bio) throw new Error('Bio is required');
  const user= await prisma.user.update({
    where:
    {
      id:Number(id)
    },data:{
      bio:bio
    }
  })
  return user
}
async changePassword(userId:string,data:any){
console.log("🚀 ~ UserService ~ changePassword ~ userId:", userId)
console.log("🚀 ~ UserService ~ changePassword ~ data:", data)
const user=await prisma.user.findFirst({
  where:{
    id:Number(userId)
  }
})
if (!user) {
  throw HttpException.notFound(`User not found`);
}
const isPasswordMatch = await  BcryptService.compare(data.password, user.password);
console.log("🚀 ~ UserService ~ changePassword ~ isPasswordMatch:", isPasswordMatch)
if (!isPasswordMatch) {
  throw HttpException.badRequest(`Please enter the correct password`);
}
const hashedPassword = await BcryptService.hash(data.updatedPassword);

const save=await prisma.user.update({
  where:{id:Number(userId)},
  data:{
    password:hashedPassword
  }
})
return save


}
async verifyEmail(email: string) {
  const user = await prisma.user.findUnique({where: {email}});
  if (!user) throw HttpException.notFound(Message.notFound);
  return user;
}
async setToken(id: number, token: string): Promise<string> {
  // await this.userRepo.update(id, {token});
  await prisma.user.update({
    where: {id:Number(id)},
    data: {token},
  })
  return Message.updated;
}
async setOptVerified(email: string, verified: boolean) {
  const user = await prisma.user.findFirst({where: {email}});
  if (!user) throw HttpException.notFound(Message.notFound);
  await prisma.user.update({
    where: {id:user.id},
    data: {otpVerified: verified},
  })
  return Message.updated;
}
async resetPassword(data:any){
  console.log("🚀 ~ UserService ~ resetPassword ~ data:", data)
  try{  
    console.log(data.email)
    const user= await prisma.user.findUnique({
      where: {email:data.email,otpVerified: true}
    })
    console.log("🚀 ~ AuthService ~ resetPassword ~ user:", user)
    if(!user)throw HttpException.notFound(Message.notFound)
      if(!user.token) throw HttpException.notFound(Message.notFound)
    const [expires]=user.token.split('.')
    if(Date.now()>+expires) throw HttpException.badRequest(Message.otpExpired)
      const hashedPassword = await BcryptService.hash(data.newPassword);
  
  const update = await prisma.user.update({
    where: {id:user.id},
    data: {password: hashedPassword, otpVerified: false, token: ''},
  });
    return update
  }catch(error:any){
    console.log("🚀 ~ UserService ~ resetPassword ~ error:", error)
    throw HttpException.badRequest(error.message)
  }
    // console.log("🚀 ~ UserService ~ resetPassword ~ user:", user)
}
}
export default new UserService();
