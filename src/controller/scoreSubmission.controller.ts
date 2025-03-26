import express from 'express';
import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();
import {Request, Response} from 'express';
import gameService from '../services/game.service';
import scoreSubmissionService from '../services/scoreSubmission.service';

class ScoreSubmissionController {
  async createSubmission(req: Request, res: Response) {
    console.log('ya xitro??');
    try {
      const data ={...req.body};
      console.log("🚀 ~ ScoreSubmissionController ~ createSubmission ~ data:", data)
      const matchId = req.params.id;
      console.log('🚀 ~ ScoreSubmissionController ~ createSubmission ~ matchId:', matchId);
      const userId = req.user?.id;
      const files = req.files as {[fieldname: string]: Express.Multer.File[]} | undefined;
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      // Construct the full URLs for gameCoverImage and gameIcon
      const score_submission_image = files?.['score_submission_image']
        ? `${baseUrl}/${files['score_submission_image'][0].path.replace(/\\/g, '/')}` // Replace backslashes for Windows
        : null;
      const scoreService = await scoreSubmissionService.createSubmission(
        data,
        matchId,
        score_submission_image as string,
        userId as string);
      res.status(201).json({data: scoreService});
    } catch (error: any) {
    console.log('🚀 ~ ScoreSubmissionController ~ createSubmission ~ error:', error);
    res.status(500).json({error: error.message});
    }
  }
  async getPendingSubmissions(req: Request, res: Response) {
    try {
      const submissions = await scoreSubmissionService.getPendingSubmissions()
      res.status(200).json({data: submissions});
    } catch (error: any) {
      res.status(500).json({error: error.message});
    }
  }
  async giveDecision(req:Request,res:Response){
    console.log('ya pugoo???')
    try {
      const {decision} = req.body;
      console.log("🚀 ~ ScoreSubmissionController ~ giveDecision ~ decision:", decision)
      const submissionId = req.params.id;
      const userId = req.user?.id;
      const submission = await scoreSubmissionService.giveDecision(submissionId, decision, userId);
      res.status(200).json({data: submission});
    } catch (error: any) {
      res.status(500).json({error: error.message});
    }
  }
}
export default new ScoreSubmissionController();
