import HttpException from '../utils/HttpException.utils';
import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();

class scoreSubmissionService {
  async createSubmission(data: any, matchId: any, score_submission_image: string, userId: string) {
   console.log("🚀 ~ scoreSubmissionService ~ createSubmission ~ data:", data)
   try{
    const match = await prisma.match.findUnique({
      where: {id: Number(matchId)},
    });
    if (!match) {
      throw HttpException.badRequest(`match not found...`);
    }
    console.log(match.player1Id, match.player2Id, userId);
    if (match.player1Id == Number(userId) || match.player2Id == Number(userId)) {
      const scoreSubmissionDataExists = await prisma.scoreSubmission.findMany({
        where: {matchId: Number(matchId)},
      });
     
      for(let i = 0; i < scoreSubmissionDataExists.length; i++) {
        if (scoreSubmissionDataExists[i].submittedBy == Number(userId)) {
          console.log('score already exists')
          throw HttpException.badRequest(`Score is already submitted by this user...`);
        }
      }
     
      const tournament = await prisma.tournament.findUnique({
        where: {id: match.tournamentId},
      });
      console.log('data', data.points);

      if (!tournament?.is_points_based) {
        const submitScore = await prisma.scoreSubmission.create({
          data: {
            submittedBy: Number(userId),
            matchId: Number(matchId),
            screenshot: score_submission_image,
            playerScore: Number(data.points),
            
          },
        });

        return submitScore;
      }
      if (tournament?.is_points_based) {
        const submitScore = await prisma.scoreSubmission.create({
          data: {
            submittedBy: Number(userId),

            matchId: Number(matchId),
            screenshot: score_submission_image,
            playerScore: Number(data.points),
            kills: Number(data.kills),
            placement: Number(data.placement)
          },
        });
        console.log("🚀 ~ scoreSubmissionService ~ createSubmission ~ submitScore:", submitScore)

        return submitScore;
      }
    } else {
      console.log('yai ho ra??');
      throw HttpException.badRequest(`You are not a player of this match...`);
    }
}catch(error:any) {
  console.log("🚀 ~ scoreSubmissionService ~ createSubmission ~ error:", error)
  }
  }


  async getPendingSubmissions() {
    const submissions = await prisma.scoreSubmission.findMany({
      where: { status: 'PENDING' },
      include: {
        match: {
          include: {
            tournament: {
              select: {
                id: true,
                tournament_name: true,
                is_points_based: true
              }
            },
            player1: { select: { id: true, username: true } },
            player2: { select: { id: true, username: true } },
            team1: { select: { id: true, team_name: true } },
            team2: { select: { id: true, team_name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return submissions;
  }
  async giveDecision(submissionId: any, decision: any,userId:any) {
    try{
    const submission = await prisma.scoreSubmission.findUnique({
      where: { id: Number(submissionId) }
    });
    if (!submission) {
      throw HttpException.badRequest(`Submission not found...`);
    }
    const match = await prisma.match.findUnique({
      where: { id: submission.matchId }
    });
    if (!match) {
      throw HttpException.badRequest(`Match not found...`);
    }
    const isAdmin=await prisma.user.findUnique({
      where:{id:Number(userId)}});
      console.log("🚀 ~ scoreSubmissionService ~ giveDecision ~ isAdmin:", isAdmin)
      if(isAdmin?.role!="admin"){
        throw HttpException.badRequest(`You are not authorized to perform this action...`);
      }
      const updatedSubmission = await prisma.scoreSubmission.update({
        where: { id: Number(submissionId) },
        data: { status: decision }
      });
      //Evaludate elimination tournament scores when both submissions are approved
      
        if (decision === 'APPROVED') {
          const tournament = await prisma.tournament.findUnique({
              where: { id: match.tournamentId }
          });
          if (!tournament?.is_points_based) { // Elimination tournament
            const approvedSubmissions = await prisma.scoreSubmission.findMany({
                where: {
                    matchId: submission.matchId,
                    status: 'APPROVED'
                }
            });
            if(approvedSubmissions.length ===2){
              const player1Submission = approvedSubmissions.find(s => s.submittedBy === match.player1Id);
              const player2Submission = approvedSubmissions.find(s => s.submittedBy === match.player2Id);

              if (!player1Submission || !player2Submission) {
                throw HttpException.badRequest(`Both submissions are required for elimination tournament...`);
              }
              
              const player1Score = player1Submission.playerScore || 0;
              const player2Score = player2Submission.playerScore || 0;
              let winnerId:number | null = null;
              if (player1Score > player2Score) {
                winnerId = match.player1Id;
            } else if (player2Score > player1Score) {
                winnerId = match.player2Id;
            } else {
                throw  HttpException.badRequest(`Scores tied. Manual resolution needed.`);
            }
            await prisma.match.update({
              where: { id: match.id },
              data: {
                  winnerId: winnerId,
                  status: 'COMPLETED'
              }
          });
            }
          }
      }


      return updatedSubmission;
    }catch(error:any) {
      console.log("🚀 ~ scoreSubmissionService ~ giveDecision ~ error:", error)
      
    }
    
  }
}

export default new scoreSubmissionService();
