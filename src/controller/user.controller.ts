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
class UserController {
  async changePassword(req: Request, res: Response) {
    const body = req.body;
    const userId = req.user?.id;
    const data = await userService.changePassword(userId as string, body);
    res.status(StatusCodes.CREATED).json({
      status: true,
      message: Message.updated,
      data: data,
    });
  }
  async verifyEmail(req: Request, res: Response) {
    try {
      const user = await userService.verifyEmail(req.body.email);
      const otp = await OtpService.generateOtp();
      // valid for 5 minute
      const expires = Date.now() + 60000 * 5;
      const payload = `${req?.body?.email}.${otp}.${expires}`;
      const hash = HashService.hashOtp(payload);
      const token = `${hash}.${expires}`;

      await userService.setToken(user.id, token);
      const reset = await OtpService.sendPasswordResetOtpMail({
        email: req.body.email,
        otp: `${otp}`,
      });

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
      if (!user.token) throw HttpException.notFound(Message.notFound);
      const [hashedOtp, expires] = user.token.split('.');
      // + sign le string lai integer ma convert garxa
      if (Date.now() > +expires) throw HttpException.badRequest(Message.otpExpired);
      const payload = `${req.body.email}.${req.body.otp}.${expires}`;
      const data = await OtpService.verifyOtp(hashedOtp, payload);
      if (!data) throw HttpException.notFound;
      const setTrue = await userService.setOptVerified(req.body.email, true);
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
    try {
      const data = await userService.resetPassword(req.body);
      res.status(StatusCodes.SUCCESS).json({
        data: data,
        status: true,
        message: Message.passwordChange,
      });
    } catch (error) {
      throw HttpException.badRequest(`Internal Error`);
    }
  }
  async create(req: Request, res: Response) {
    try {
      const baseurl = `${req.protocol}://${req.get('host')}`;
      const files = req.files as {[fieldname: string]: Express.Multer.File[]} | undefined;
      const profileImage = files?.['image']
        ? `${baseurl}/${files['image'][0].path.replace(/\\/g, '/')}`
        : null;

      const {username, email, password} = req.body;
      const service = await userService.register(username, email, password, profileImage as string);
      res.status(StatusCodes.CREATED).json({
        status: true,
        message: Message.created,
        data: service,
      });
    } catch (error: any) {
      throw HttpException.badRequest(error.message);
    }
  }
  async getNotification(req:Request,res:Response){
    try{
      const userId = req.user?.id;
      const data = await userService.getNotification(userId as string);
      res.status(StatusCodes.SUCCESS).json({
        status: true,
        message: Message.fetched,
        data: data,
      });
    }catch(error:any){
      throw HttpException.badRequest(error.message);
    }
  }
  async markAsRead(req:Request,res:Response){
    try{
      const data = await userService.markAsRead(req.body.notificationId);
      res.status(StatusCodes.SUCCESS).json({
        status: true,
        message: Message.updated,
        data: data,
      });
    }catch(error:any){
      throw HttpException.badRequest(error.message);
    }
  }
  async getAllUsers(req:Request,res:Response){
    try{
      const data = await userService.getAllUsers();
      res.status(StatusCodes.SUCCESS).json({
        status: true,
        message: Message.fetched,
        data: data,
      });
    }catch(error:any){
      throw HttpException.badRequest(error.message);
    }
  }
  async updateBio(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { bio } = req.body;
      const updatedUser = await userService.updateBio(userId as string, bio);
      res.status(StatusCodes.SUCCESS).json({
        status: true,
        message: Message.updated,
        data: updatedUser,
      });
    } catch (error: any) {
      throw HttpException.badRequest(error.message);
    }
  }
  async updateProfile(req: Request, res: Response) {
    try {
      const baseurl = `${req.protocol}://${req.get('host')}`;
      const files = req.files as {[fieldname: string]: Express.Multer.File[]} | undefined;
      const profileImage = files?.['image']
        ? `${baseurl}/${files['image'][0].path.replace(/\\/g, '/')}`
        : null;

      const userId = req.params?.id;
      const {username, email} = req.body;
      const service = await userService.updateProfile(
        userId as string,
        username,
        email,
        profileImage as string
      );
      res.status(StatusCodes.CREATED).json({
        status: true,
        message: Message.updated,
        data: service,
      });
    } catch (error: any) {
      console.log("🚀 ~ UserController ~ updateProfile ~ error:", error)
      throw HttpException.badRequest(error.message);
    }
  }
  async deleteUser(req: Request, res: Response) {
    try {
      const userId = req.params?.id;
      const service = await userService.deleteUser(userId as string);
      res.status(StatusCodes.CREATED).json({
        status: true,
        message: Message.deleted,
        data: service,
      });
    } catch (error: any) {
      throw HttpException.badRequest(error.message);
    }
  }
}
export default new UserController();
