import {StatusCodes} from '../constant/statusCodes';
import userService from '../services/user.service';
import {Message} from '../constant/messages';
import OtpService from '../services/otp.service';
import webTokenService from '../utils/webToken.service';
import {Role} from '../constant/enum';
import HttpException from '../utils/HttpException.utils';
import AppError from '../utils/HttpException.utils';
import HashService from '../services/hash.service';

import {type Request, type Response} from 'express';
 class UserController{
    async changePassword(req:Request,res:Response){
        const body=req.body;
        const userId=req.user?.id;
       const data= await userService.changePassword(userId as string,body)
       res.status(StatusCodes.CREATED).json({
        status: true,
        message: Message.updated,
        data: data,
      });
    }
    async verifyEmail(req: Request, res: Response) {
        try {
          const user = await userService.verifyEmail(req.body.email);
          console.log('🚀 ~ UserAuthController ~ verifyEmail ~ user:', user);
          const otp = await OtpService.generateOtp();
          console.log('🚀 ~ UserAuthController ~ verifyEmail ~ otp:', otp);
          // valid for 5 minute
          const expires = Date.now() + 60000 * 5;
          const payload = `${req?.body?.email}.${otp}.${expires}`;
          console.log('🚀 ~ UserAuthController ~ verifyEmail ~ payload:', payload);
          const hash = HashService.hashOtp(payload);
          console.log('🚀 ~ UserAuthController ~ verifyEmail ~ hash:', hash);
          const token = `${hash}.${expires}`;
    
          console.log('🚀 ~ UserAuthController ~ verifyEmail ~ token:', token);
          await userService.setToken(user.id, token);
          const reset = await OtpService.sendPasswordResetOtpMail({
            email: req.body.email,
            otp: `${otp}`,
          });
          console.log('🚀 ~ UserAuthController ~ verifyEmail ~ reset:', reset);
    
          res.status(StatusCodes.SUCCESS).json({
            status: true,
            message: Message.emailSent,
          });
        } catch (error: any) {
          throw HttpException.badRequest(error.message);
        }
      }
      async verifyOtp(req: Request, res: Response) {
        try {
          const user = await userService.verifyEmail(req.body.email);
          console.log(req.body.otp, 'betenata');
          console.log(req.body.email);
          if(!user.token) throw HttpException.notFound(Message.notFound);
          const [hashedOtp, expires] = user.token.split('.');
          // + sign le string lai integer ma convert garxa
          if (Date.now() > +expires) throw HttpException.badRequest(Message.otpExpired);
          const payload = `${req.body.email}.${req.body.otp}.${expires}`;
          const data = await OtpService.verifyOtp(hashedOtp, payload);
          if (!data) throw HttpException.notFound;
          const setTrue = await userService.setOptVerified(req.body.email, true);
          console.log('🚀 ~ UserAuthController ~ verifyOtp ~ data:', data);
          res.status(StatusCodes.SUCCESS).json({
            data: setTrue,
            status: true,
            message: Message.validOtp,
          });
        } catch (error) {
          throw HttpException.badRequest(`Internal Error`);
        }
      }
      async resetPassword(req: Request, res: Response) {
        try{
          console.log(req.body);
          const data = await userService.resetPassword(req.body);
          console.log('🚀 ~ UserAuthController ~ resetPassword ~ data:', data);
          res.status(StatusCodes.SUCCESS).json({
            data: data,
            status: true,
            message: Message.passwordChange,
          });
        }catch(error){
          throw HttpException.badRequest(`Internal Error`);
    
        }
      
      }
}
export default new UserController()