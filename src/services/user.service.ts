
import HttpException from '../utils/HttpException.utils';
import BcryptService from '../utils/bcryptService';
import {createToken, verifyToken} from '../utils/tokenManager';
import {addMinutes} from 'date-fns';
import {randomInt} from 'crypto';
import { accountActivationMail } from '../utils/mail.template';
import { PrismaClient } from '@prisma/client';
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
    if (!user) {
        throw HttpException.notFound(`Invalid credentials`);
    }
    const matchPassword = await BcryptService.compare(password, user.password!);
    if (!matchPassword) {
        throw HttpException.notFound(`Invalid credentials`);
    }
    const token = createToken(
        { id: user.id },
        process.env.JWT_SECRET,
        process.env.BROWSER_COOKIES_EXPIRES_IN
    );
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        token,
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

}
export default new UserService();
