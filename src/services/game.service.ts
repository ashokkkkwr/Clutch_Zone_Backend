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
const prisma=new PrismaClient();


class GameService{
async createGame(game_name:string,gameCoverImage:string,gameIcon:string){
    if(!game_name) throw  HttpException.badRequest('Game name is required');
    const newGame = await prisma.games.create({
            data: {
                game_name,
                game_cover_image: gameCoverImage,
                game_icon: gameIcon,
            },
        });
    
        return newGame;
}
async getGames(){
    const games=await prisma.games.findMany();
    return games;
}
async deleteGame(id:string){
    console.log(typeof id)
    console.log("🚀 ~ GameService ~ deleteGame ~ id:", id)

        const deletedGame=await prisma.games.delete({
            where:{
                id:parseInt(id)
            }
        });
        console.log("🚀 ~ GameService ~ deleteGame ~ deletedGame:", deletedGame)
        return deletedGame;
    }
}


export default new GameService();
