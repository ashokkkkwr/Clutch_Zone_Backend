import express from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();
import {Request,Response} from 'express';
import gameService from '../services/game.service';
import scoreSubmissionService from '../services/scoreSubmission.service';

 class ScoreSubmissionController {
    async createSubmission(req: Request, res: Response) {
        console.log('ya xitro??')
        try{

        
        const data=req.body
        const matchId=req.params.id
        console.log("🚀 ~ ScoreSubmissionController ~ createSubmission ~ matchId:", matchId)
       console.log(data,'-----------------')
const userId = req.user?.id;


       const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
       const baseUrl = `${req.protocol}://${req.get('host')}`;
   
       // Construct the full URLs for gameCoverImage and gameIcon
       const score_submission_image = files?.['score_submission_image'] ? `${baseUrl}/${files['score_submission_image'][0].path.replace(/\\/g, '/')}` // Replace backslashes for Windows
           : null;
      const scoreService= await scoreSubmissionService.createSubmission(data,matchId,score_submission_image as string,userId as string)
      res.status(201).json({data:scoreService })
        }catch(error:any){
            console.log("🚀 ~ ScoreSubmissionController ~ createSubmission ~ error:", error)
            res.status(500).json({error:error.message})
        }
   
    }
   
}
export default new ScoreSubmissionController();