import { AppDataSource } from '../config/database.config'
import { User } from '../entities/user/user.entity'
import { Message } from '../constant/messages'
import HttpException from '../utils/HttpException.utils'
import BcryptService from '../utils/bcryptService'
import { transferImageFromUploadToTemp } from '../utils/path.utils'


class UserService{
    constructor(
        private readonly userRepo= AppDataSource.getRepository(User)
    ){}
    async register(username:string,email:string,password:string){
        if(!username)throw HttpException.badRequest(`Fullname is required.`)
        if(!email)throw HttpException.badRequest(`Email is required`)
        if(!password) throw HttpException.badRequest('Password is required')
        const userEmailExists=await this.userRepo.findOne({
    where:{email}
    })
    
        
}

}
export default new UserService()