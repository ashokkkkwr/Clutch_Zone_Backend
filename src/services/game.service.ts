
import HttpException from '../utils/HttpException.utils';
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
    async getUnFavaurities(userId: string) {
        const unfavoritedGames = await prisma.games.findMany({
            where: {
                game_favaurites: {
                    none: {
                        user_id: parseInt(userId),
                    },
                },
                
            },
        });
        console.log("🚀 ~ GameService ~ getUnFavaurities ~ unfavoritedGames:", unfavoritedGames)
        return unfavoritedGames;
    }
}


export default new GameService();
