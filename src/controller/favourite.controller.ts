import { Request, Response } from 'express';
import FavouriteService from '../services/favourite.service';

class FavouriteController {
    async addFavourite(req: Request, res: Response): Promise<void> {
        const data = req.body;
        const userId = req?.user?.id;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        try {
            const savedFavourite = await FavouriteService.addFavourite(data, userId);
            if(savedFavourite instanceof Error){
                res.status(500).json({ message: savedFavourite.message });  
            }
            res.status(200).json({
                data: savedFavourite,
                message: 'Favourite added successfully'
            });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getUserFavouriteGames(req:Request,res:Response){
        const userId = req?.user?.id;
        const games = await FavouriteService.getUserFavourite(userId!)
        res.status(200).json(games)
    }
}

export default new FavouriteController();