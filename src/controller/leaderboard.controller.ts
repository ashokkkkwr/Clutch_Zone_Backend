// controllers/LeaderBoard.controller.ts
import { Request, Response } from 'express';
import leaderBoardService from '../services/leaderBoard.service';

class LeaderBoardController {
    async getLeaderBoard(req: Request, res: Response) {
        try {
            const leaderboardData = await leaderBoardService.getLeaderBoard();
            res.status(200).json({
                success: true,
                data: leaderboardData
            });
        } catch (error:any) {
            res.status(error.status || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }
}

export default new LeaderBoardController();