import { PrismaClient } from '@prisma/client';
import HttpException from '../utils/HttpException.utils';

const prisma = new PrismaClient();

class FavouriteService {
    async addFavourite(data: any, userId: any) {
        const gameid = data.gameId; // Correct key
        console.log("🚀 ~ FavouriteService ~ addFavourite ~ gameid:", gameid)
       if(!gameid){
        return HttpException.internalServerError("Game Id is required in the body");

       }
        try {
            const ifAlreadyExists = await prisma.game_favaurites.findFirst({
                where: {
                    user_id: Number(userId),
                    game_id: Number(gameid) // Ensure it's converted to a number
                }
            });

            if (ifAlreadyExists) {
                throw HttpException.internalServerError("Internal server error");
            }

            const savedFavourite = await prisma.game_favaurites.create({
                data: {
                    user_id: Number(userId), // Ensure user ID is a number
                    game_id: Number(gameid)  // Fix: Use `gameId` from request
                }
            });

            return savedFavourite;
        } catch (error) {
            console.error('Error adding favourite:', error);
            // throw new HttpException(500, 'Internal server error');
            return
        }
    }
    async getUserFavourite(userId: string){
        const userFavourites = await prisma.game_favaurites.findMany({
            where: {
                user_id: Number(userId)
            },select:{
                games:true,
                
            }
        });
        return userFavourites;
    }
}


export default new FavouriteService();