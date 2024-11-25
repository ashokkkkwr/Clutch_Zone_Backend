import {StatusCodes} from '../constant/statusCodes';
import userService from '../services/user.service';
import {Message} from '../constant/messages';

import webTokenService from '../utils/webToken.service';
import {Role} from '../constant/enum';
import HttpException from '../utils/HttpException.utils';
import AppError from '../utils/HttpException.utils';
import {type Request, type Response} from 'express';

export class UserController{
    async register(req:Request,res:Response){
        const {fullname,email,password}=req.body;
        // await userService.register(req.body)
    }
}