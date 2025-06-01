import HttpException from '../utils/HttpException.utils';
import {PrismaClient} from '@prisma/client';
import {io, getSocketIdByUserId} from '../socket/sockets';
const prisma = new PrismaClient();

class GameService {
  async createGame(game_name: string, gameCoverImage: string, gameIcon: string) {
    if (!game_name) throw HttpException.badRequest('Game name is required');
    const existingGame = await prisma.games.findFirst({
      where: {
        game_name,
      },
    });
  
    if (existingGame) {
      throw HttpException.badRequest('Game name already exists');
    }
    
    const newGame = await prisma.games.create({
      data: {
        game_name,
        game_cover_image: gameCoverImage,
        game_icon: gameIcon,
      },
    });

    const getUserId = await prisma.user.findFirst({
      where: {
        id: 2,
      },
    });
    console.log('🚀 ~ GameService ~ createGame ~ getUserId:', getUserId);
    // Get the socket ID for the user
    if (getUserId) {
      const socketId = await getSocketIdByUserId(getUserId.id.toString());
      console.log('🚀 ~ GameService ~ createGame ~ socketId:', socketId);

      io.to(socketId!).emit('notification', newGame);
    }
    return newGame;
  }
  async getGames() {
    const games = await prisma.games.findMany();
    return games;
  }
  async deleteGame(id: string) {
    const deletedGame = await prisma.games.delete({
      where: {
        id: parseInt(id),
      },
    });
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
    return unfavoritedGames;
  }
}

export default new GameService();
