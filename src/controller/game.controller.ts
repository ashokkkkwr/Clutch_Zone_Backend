import express from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();
// import {upload} from '../middleware/multer.middleware';
import {Request,Response} from 'express';
import gameService from '../services/game.service';

 class GameController {
    async createGame(req: Request, res: Response) {
        const { game_name } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const baseUrl = `${req.protocol}://${req.get('host')}`;
    
        // Construct the full URLs for gameCoverImage and gameIcon
        const gameCoverImage = files?.['game_cover_image'] ? `${baseUrl}/${files['game_cover_image'][0].path.replace(/\\/g, '/')}`
            : null;
        const gameIcon = files?.['game_icon']
            ? `${baseUrl}/${files['game_icon'][0].path.replace(/\\/g, '/')}`
            : null;
    
    
        // Save the game data
        const saved = await gameService.createGame(
            game_name,
            gameCoverImage as string,
            gameIcon as string
        );
        return res.status(201).json({ message: 'Game created successfully', data: saved });
    }
    async getGame(req: Request, res: Response) {
        const { id } = req.params;
        const game = await prisma.games.findUnique({
            where: {
                id: parseInt(id),
            },
        });
       if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }
        res.status(200).json(game)
    }
    async updateGame(req:Request, res:Response){
        console.log('update')
        try{
            const {game_name}=req.body;

            const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
            const baseUrl = `${req.protocol}://${req.get('host')}`;

            const gameCoverImage = files?.['game_cover_image'] ? `${baseUrl}/${files['game_cover_image'][0].path.replace(/\\/g, '/')}` // Replace backslashes for Windows
            : null;
            console.log("🚀 ~ GameController ~ updateGame ~ gameCoverImage:", gameCoverImage)
        const gameIcon = files?.['game_icon']
        ? `${baseUrl}/${files['game_icon'][0].path.replace(/\\/g, '/')}`
        : null;
        
        console.log("🚀 ~ GameController ~ updateGame ~ gameIcon:", gameIcon)

        const updatedGame=await prisma.games.update({
            where:{
                id:parseInt(req.params.id)
            },
            data:{
                game_name,
                ...(gameCoverImage && { game_cover_image: gameCoverImage }),
                ...(gameIcon && { game_icon: gameIcon }),
            }
        })
        res.status(200).json(updatedGame)
        }catch(error){
            if(error instanceof Error){
                res.status(500).json({error:error.message});    
            }
            else{
                res.status(500).json({error:"Something went wrong"});
            }
        }
    }
    async deleteGame(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const gameId = parseInt(id);
    
            // First check if game exists
            const game = await prisma.games.findUnique({
                where: { id: gameId },
            });
    
            if (!game) {
                return res.status(404).json({ error: 'Game not found' });
            }
    
           
    
            const tournaments = await prisma.tournament.findMany({
                where: { games_id: gameId }
              });
              
              const tournamentIds = tournaments.map(t => t.id);
              
              await prisma.match.deleteMany({
                where: { tournamentId: { in: tournamentIds } }
              });
              
              await prisma.tournament.deleteMany({
                where: { id: { in: tournamentIds } }
              });
    
            await prisma.in_game_id.deleteMany({
                where: { game_id: gameId },
            });
    
            await prisma.game_favaurites.deleteMany({
                where: { game_id: gameId },
            });
    
            // Now delete the game itself
            await prisma.games.delete({
                where: { id: gameId },
            });
    
            return res.status(200).json({ message: 'Game deleted successfully' });
    
        } catch (error) {
            console.error(error);
            if (error instanceof Error) {
                return res.status(500).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Something went wrong' });
        }
    }
    
}
export default new GameController();