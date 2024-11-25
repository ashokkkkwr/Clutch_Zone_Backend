import {AppDataSource} from '../config/database.config';
import {User} from '../entities/user/user.entity';
import {Message} from '../constant/messages';
import HttpException from '../utils/HttpException.utils';
import BcryptService from '../utils/bcryptService';
import {transferImageFromUploadToTemp} from '../utils/path.utils';
import {createToken,verifyToken} from '../utils/tokenManager';
import { DotenvConfig } from '../config/env.config'
import {accountActivationMail} from '../utils/mail.template'
class UserService {
  constructor(private readonly userRepo = AppDataSource.getRepository(User)) {}
  async register(username: string, email: string, password: string) {
    console.log('🚀 ~ UserService ~ register ~ password:', password);
    console.log('🚀 ~ UserService ~ register ~ email:', email);
    console.log('🚀 ~ UserService ~ register ~ username:', username);
  
    if (!username) throw HttpException.badRequest(`Fullname is required.`);
    if (!email) throw HttpException.badRequest(`Email is required`);
    if (!password) throw HttpException.badRequest('Password is required');
  
    const userEmailExists = await this.userRepo.findOne({
      where: { email },
    });
  
    if (userEmailExists) {
      throw new Error("You have already registered with this email");
    }
  
    const hash = await BcryptService.hash(password);
    const user = {
      username,
      email,
      password: hash,
    };
    

    const save =  this.userRepo.create({
        email:email,
        username,
        password:hash
  
    })
    const users = await this.userRepo.save(save)
    const activationToken = createToken(
      user,
      DotenvConfig.ACTIVATION_SECRET,
      "5m"
    ).toString();
  
  }  
}
export default new UserService();
