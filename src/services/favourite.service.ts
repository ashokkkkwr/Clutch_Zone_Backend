import { PrismaClient } from '@prisma/client';
import HttpException from '../utils/HttpException.utils';

const prisma = new PrismaClient();

class FavouriteService {
    async addFavourite(data: any, userId: any) {
        const gameid = data.gameId; // Correct key
        console.log("🚀 ~ FavouriteService ~ addFavourite ~ gameid:", gameid);
        console.log("🚀 ~ FavouriteService ~ addFavourite ~ data:", data);

        try {
            const ifAlreadyExists = await prisma.game_favaurites.findFirst({
                where: {
                    user_id: Number(userId),
                    game_id: Number(gameid) // Ensure it's converted to a number
                }
            });

            console.log("🚀 ~ FavouriteService ~ addFavourite ~ ifAlreadyExists:", ifAlreadyExists);
            if (ifAlreadyExists) {
                return  HttpException.badRequest('Game is already in your favourites');
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