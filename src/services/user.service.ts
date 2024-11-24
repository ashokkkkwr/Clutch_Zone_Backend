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
    async register(data:any){
        if(!data.fullname)throw HttpException.badRequest(`Fullname is required.`)
        if(!data.email)throw HttpException.badRequest(`Email is required`)
        if(!data.password) throw HttpException.badRequest('Password is required')
        const userEmailExists=await this.userRepo.findOne({
    where:{email:data.email}
    })
    
        
}

}
export default new UserService()