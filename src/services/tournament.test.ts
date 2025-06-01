// src/services/tournament.test.ts

// 1) Declare all your mocks up front
const mockCreate = jest.fn();
const mockFindFirst = jest.fn();
const mockFindManyGames = jest.fn();
const mockDelete = jest.fn();

const mockEmit = jest.fn();
const mockTo = jest.fn().mockReturnThis();
const mockGetSocketIdByUserId = jest.fn();

// 2) Use jest.doMock (not jest.mock) so these run in place
jest.doMock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    games: {
      create: mockCreate,
      findMany: mockFindManyGames,
      delete: mockDelete,
    },
    user: {
      findFirst: mockFindFirst,
    },
  })),
}));

jest.doMock('../socket/sockets', () => ({
  io: {
    to: mockTo,
    emit: mockEmit,
  },
  getSocketIdByUserId: mockGetSocketIdByUserId,
}));

// 3) Now that the modules are mocked, import your service and any types you need
import HttpException from '../utils/HttpException.utils';
import gameService from './game.service';
import { io, getSocketIdByUserId } from '../socket/sockets';

describe('GameService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGame', () => {
    it('throws BadRequest if game_name is missing', async () => {
      await expect(
        gameService.createGame('', 'cover.png', 'icon.png')
      ).rejects.toThrow(HttpException);
    });

    it('creates a game and emits notification if user found', async () => {
      const fakeGame = { id: 1, game_name: 'Chess', game_cover_image: 'c.png', game_icon: 'i.png' };
      const fakeUser = { id: 2, name: 'Alice' };

      mockCreate.mockResolvedValue(fakeGame);
      mockFindFirst.mockResolvedValue(fakeUser);
      mockGetSocketIdByUserId.mockResolvedValue('socket123');

      const result = await gameService.createGame('Chess', 'c.png', 'i.png');

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          game_name: 'Chess',
          game_cover_image: 'c.png',
          game_icon: 'i.png',
        },
      });
      expect(mockFindFirst).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(mockGetSocketIdByUserId).toHaveBeenCalledWith('2');
      expect(mockTo).toHaveBeenCalledWith('socket123');
      expect(mockEmit).toHaveBeenCalledWith('notification', fakeGame);
      expect(result).toEqual(fakeGame);
    });

    it('creates a game and does not emit if no user found', async () => {
      const fakeGame = { id: 5, game_name: 'Go', game_cover_image: 'g.png', game_icon: 'g2.png' };

      mockCreate.mockResolvedValue(fakeGame);
      mockFindFirst.mockResolvedValue(null);

      const result = await gameService.createGame('Go', 'g.png', 'g2.png');

      expect(mockCreate).toHaveBeenCalled();
      expect(mockFindFirst).toHaveBeenCalled();
      expect(mockEmit).not.toHaveBeenCalled();
      expect(result).toEqual(fakeGame);
    });
  });

  describe('getGames', () => {
    it('returns list of games from prisma', async () => {
      const gamesList = [
        { id: 1, game_name: 'A' },
        { id: 2, game_name: 'B' },
      ];
      mockFindManyGames.mockResolvedValue(gamesList);

      const result = await gameService.getGames();
      expect(mockFindManyGames).toHaveBeenCalled();
      expect(result).toBe(gamesList);
    });
  });

  describe('deleteGame', () => {
    it('deletes and returns the deleted game', async () => {
      const deleted = { id: 99, game_name: 'X' };
      mockDelete.mockResolvedValue(deleted);

      const result = await gameService.deleteGame('99');
      expect(mockDelete).toHaveBeenCalledWith({ where: { id: 99 } });
      expect(result).toEqual(deleted);
    });

    it('parses id string to integer', async () => {
      mockDelete.mockResolvedValue({ id: 42 });
      await gameService.deleteGame('42');
      expect(mockDelete).toHaveBeenCalledWith({ where: { id: 42 } });
    });
  });

  describe('getUnFavaurities', () => {
    it('returns games none of whose favourites include the user', async () => {
      const unfav = [{ id: 7, game_name: 'Y' }];
      mockFindManyGames.mockResolvedValue(unfav);

      const result = await gameService.getUnFavaurities('7');
      expect(mockFindManyGames).toHaveBeenCalledWith({
        where: {
          game_favaurites: {
            none: {
              user_id: 7,
            },
          },
        },
      });
      expect(result).toEqual(unfav);
    });
  });
});
