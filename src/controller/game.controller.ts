import express from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();
// import {upload} from '../middleware/multer.middleware';
import {Request,Response} from 'express';
import gameService from '../services/game.service';

 class GameController {
  async createGame(req: Request, res: Response) {
        const { game_name } = req.body;
        console.log("🚀 ~ GameController ~ createGame ~ game_name:", game_name)
        console.log("🚀 ~ GameController ~ createGame ~ game_name:", game_name)
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const gameCoverImage = files?.['game_cover_image'] 
            ? files['game_cover_image'][0].path 
            : null;
        const gameIcon = files?.['game_icon'] 
            ? files['game_icon'][0].path 
            : null;
         const saved=  await gameService.createGame(game_name,gameCoverImage as string,gameIcon as string);
        return res.status(201).json({ message: 'Game created successfully',data: saved}); 
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
        try{
            const {game_name}=req.body;
            const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
            const gameCoverImage = files?.['game_cover_image']
            ? files['game_cover_image'][0].path
            : null;        
            const gameIcon = files?.['game_icon']
            ? files['game_icon'][0].path
            : null;

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
}
export default new GameController();