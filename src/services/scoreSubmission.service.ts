import HttpException from '../utils/HttpException.utils';
import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();

class scoreSubmissionService {
  async createSubmission(data: any, matchId: any, score_submission_image: string, userId: string) {
    const match = await prisma.match.findUnique({
      where: {id: Number(matchId)},
    });
    if (!match) {
      throw HttpException.badRequest(`match not found...`);
    }
    console.log(match.player1Id, match.player2Id, userId);
    if (match.player1Id != Number(userId) ||  match.player2Id != Number(userId)) {
      throw HttpException.badRequest(`You are not a player of this match...`);
    }
    const scoreSubmissionDataExists = await prisma.scoreSubmission.findFirst({
      where: {matchId: matchId},
    });
    if (scoreSubmissionDataExists && scoreSubmissionDataExists.submittedBy == Number(userId)) {
      throw HttpException.badRequest(`Score is already submitted by this user...`);
    }
    const tournament = await prisma.tournament.findUnique({
      where: {id: match.tournamentId},
    });
    if (!tournament?.is_points_based) {
      const submitScore = await prisma.scoreSubmission.create({
        data: {submittedBy: Number(userId), matchId: matchId, screenshot: score_submission_image,playerScore: data.score},
      });
      return submitScore;
    }
    if(tournament?.is_points_based){
      const submitScore = await prisma.scoreSubmission.create({
        data:{
            submittedBy: Number(userId),
            matchId: matchId,
            screenshot: score_submission_image,
            playerScore: data.score,
           
        }
      });
      return submitScore;
    }

  }
}

export default new scoreSubmissionService();
