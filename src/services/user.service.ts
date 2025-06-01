import {Message} from '../constant/messages';
import HttpException from '../utils/HttpException.utils';
import BcryptService from '../utils/bcryptService';
import {transferImageFromUploadToTemp} from '../utils/path.utils';
import {createToken, verifyToken} from '../utils/tokenManager';
import {DotenvConfig} from '../config/env.config';
import {addMinutes} from 'date-fns';
import {randomInt} from 'crypto';
import {accountActivationMail} from '../utils/mail.template';
import {PrismaClient} from '@prisma/client';
import webTokenService from '../utils/webToken.service';
import {Role} from '../constant/enum';
import {io,getSocketIdByUserId} from '../socket/sockets';
const prisma = new PrismaClient();
// import redisClient from '../redisClient';
class UserService {
  async register(username: string, email: string, password: string, imagePath: string) {
    if (!username) throw HttpException.badRequest(`UserName is required.`);
    if (!email) throw HttpException.badRequest(`Email is required`);
    if (!password) throw HttpException.badRequest('Password is required');

    const userEmailExists = await prisma.user.findUnique({
      where: {email},
    });

    if (userEmailExists) {
      throw new Error('You have already registered with this email');
    }

    const hash = await BcryptService.hash(password);
    const user = {
      username,
      email,
      password: hash,
      role: Role.USER, // Assign using the Role enum
    };

    const save = await prisma.user.create({
      data: {
        email: email,
        username,
        password: hash,
        avatar: imagePath,
      },
    });
    const otp = await this.generateOtp(email);

    accountActivationMail(email, username, otp);
  }
  async generateOtp(email: string): Promise<string> {
    const user = await prisma.user.findFirst({where: {email}});
    if (!user) throw HttpException.notFound(`User with email ${email} does not exists.`);
    //Generate a random 6-digit OTP
    const otp = randomInt(100000, 999999).toString();
    const expirationTime = addMinutes(new Date(), 10);

    await prisma.user.update({
      data: {
        otp,
        otpExpiration: expirationTime,
      },
      where: {
        id: user.id,
      },
    });
    return otp;
  }
  async verifyOtp(otp: string, email: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({where: {email}});
      if (!user) throw HttpException.notFound(`User with email ${email} does not exists.`);
      if (user.otp !== otp) throw HttpException.badRequest(`OTP has expired.`);
      //clear OTP fields after successful verification
      await prisma.user.update({
        data: {
          otpExpiration: null,
          otp: null,
          otpVerified:true,
        },
        where: {
          id: user.id,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({where: {email}});
    if(user.otpVerified=== false) {
        throw HttpException.notFound(`Please verify your email`);
      }
      
    
    if (!user) {
      throw HttpException.notFound(`Invalid credentials`);
    }
    const matchPassword = await BcryptService.compare(password, user.password!);
    if (!matchPassword) {
      throw HttpException.notFound(`Invalid credentials`);
    }
    const tokenId = Number(user.id);
    const token = webTokenService.generateTokens(
      {
        id: tokenId.toString(),
      },
      user.role as Role,
    );
    if (!token) {
      throw new Error('Failed to generate token');
    }
    // await redisClient.set(token.accessToken, user.id.toString(),{
    //   EX:60*60,
    // })
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      token: token.accessToken,
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
  async updateBio(id: string, bio: string) {
    if (!bio) throw new Error('Bio is required');
    const user = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        bio: bio,
      },
    });
    return user;
  }
  async changePassword(userId: string, data: any) {
    const user = await prisma.user.findFirst({
      where: {
        id: Number(userId),
      },
    });
    if (!user) {
      throw HttpException.notFound(`User not found`);
    }
    const isPasswordMatch = await BcryptService.compare(data.password, user.password);
    if (!isPasswordMatch) {
      throw HttpException.badRequest(`Please enter the correct password`);
    }
    const hashedPassword = await BcryptService.hash(data.updatedPassword);

    const save = await prisma.user.update({
      where: {id: Number(userId)},
      data: {
        password: hashedPassword,
      },
    });
    return save;
  }
  async verifyEmail(email: string) {
    const user = await prisma.user.findUnique({where: {email}});
    if (!user) throw HttpException.notFound(Message.notFound);
    return user;
  }
  async resetPassword(data: any) {
    try {
      const user = await prisma.user.findUnique({
        where: {email: data.email, otpVerified: true},
      });
      if (!user) throw HttpException.notFound(Message.notFound);
      if (!user.token) throw HttpException.notFound(Message.notFound);
      const [expires] = user.token.split('.');
      if (Date.now() > +expires) throw HttpException.badRequest(Message.otpExpired);
      const hashedPassword = await BcryptService.hash(data.newPassword);

      const update = await prisma.user.update({
        where: {id: user.id},
        data: {password: hashedPassword, otpVerified: false, token: ''},
      });
      return update;
    } catch (error: any) {
      throw HttpException.badRequest(error.message);
    }
  }
  async setToken(id: number, token: string): Promise<string> {
    // await this.userRepo.update(id, {token});
    await prisma.user.update({
      where: {id: Number(id)},
      data: {token},
    });
    return Message.updated;
  }
  async setOptVerified(email: string, verified: boolean) {
    const user = await prisma.user.findFirst({where: {email}});
    if (!user) throw HttpException.notFound(Message.notFound);
    await prisma.user.update({
      where: {id: user.id},
      data: {otpVerified: verified},
    });
    return Message.updated;
  }

  async getNotification(userId: string) {
    const notifications = await prisma.notification.findMany({
      where: { userId: Number(userId) },
      include: {
        tournament: true,
        match: {
          include: {
            tournament: true, // Nested include: match's tournament details
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return notifications;
  }
  
  
  async markAsRead(id: string) {
    const notification = await prisma.notification.update({
      where: {id: Number(id)},
      data: {read: true},
    });
    return notification;
  }
 async getAllUsers(){
  const users = await prisma.user.findMany({
  
  });
    return users;
  }
  async updateProfile(id: string,  username:string,email:string, profileImage:string) {
    const user = await prisma.user.findFirst({
      where: {
        id: Number(id),
      },
    });
    if (!user) {
      throw HttpException.notFound(`User not found`);
    }
    const updatedUser = await prisma.user.update({
      where: {id: Number(id)},
      data: {
        username,
      email,
        avatar: profileImage,
      },
    });
    return updatedUser;
  }
  async deleteUser(id: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: Number(id),
      },
    });
    if (!user) {
      throw HttpException.notFound(`User not found`);
    }
    const deletedUser = await prisma.user.delete({
      where: {id: Number(id)},
    });
    return deletedUser;
  } 
}
export default new UserService();
