import HttpException from '../utils/HttpException.utils';
import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();

class scoreSubmissionService {
  async createSubmission(data: any, matchId: any, score_submission_image: string, userId: string) {
    try {
      const match = await prisma.match.findUnique({
        where: { id: Number(matchId) },
        include: { team1: true, team2: true }
      });
      if (!match) throw HttpException.badRequest('Match not found');
  
      const isTeamMatch = !!match.team1Id && !!match.team2Id;
      let teamId: number | null = null;
      let isEligible = false;
  
      // Check eligibility based on match type
      if (isTeamMatch) {
        // Check if user is part of either team
        const userTeam = await prisma.teamPlayers.findFirst({
          where: {
            user_id: Number(userId),
            team_id: { in: [match.team1Id!, match.team2Id!] }
          }
        });
        if (userTeam) {
          isEligible = true;
          teamId = userTeam.team_id;
        }
      } else {
        // Check if user is a player in the match
        isEligible = [match.player1Id, match.player2Id].includes(Number(userId));
      }
  
      if (!isEligible) throw HttpException.badRequest('Not a participant');
  
      // Check for existing submissions
      if (isTeamMatch) {
        const existing = await prisma.scoreSubmission.findFirst({
          where: { matchId: Number(matchId), teamId }
        });
        if (existing) throw HttpException.badRequest('Team already submitted');
      } else {
        const existing = await prisma.scoreSubmission.findFirst({
          where: { matchId: Number(matchId), submittedBy: Number(userId) }
        });
        if (existing) throw HttpException.badRequest('User already submitted');
      }
  
      // Create submission data
      const submissionData: any = {
        submittedBy: Number(userId),
        matchId: Number(matchId),
        screenshot: score_submission_image,
        playerScore: Number(data.points),
        isTeam: isTeamMatch,
        teamId: isTeamMatch ? teamId : undefined
      };
  
      const tournament = await prisma.tournament.findUnique({
        where: { id: match.tournamentId }
      });
  
      if (tournament?.is_points_based) {
        submissionData.kills = Number(data.kills);
        submissionData.placement = Number(data.placement);
      }
  
      const submitScore = await prisma.scoreSubmission.create({ data: submissionData });
      return submitScore;
  
    } catch (error) {
      console.error('Submission error:', error);
      throw error;
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
      where: { id: Number(submissionId) },
      include:{match:{include:{tournament:true}}}
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
        // Handle points-based tournaments
        if (submission.match.tournament.is_points_based) {
          let participant;
          if (submission.isTeam) {
            participant = await prisma.participant.findFirst({
              where: {
                tournamentId: submission.match.tournamentId,
                teamId: submission.teamId
              }
            });
          } else {
            participant = await prisma.participant.findFirst({
              where: {
                tournamentId: submission.match.tournamentId,
                userId: submission.submittedBy
              }
            });
          }
          if (participant) {
            await prisma.participant.update({
              where: { id: participant.id },
              data: { points: { increment: submission.playerScore || 0 } }
            });
          }
        }
  
        // Handle elimination tournaments
        const approvedSubmissions = await prisma.scoreSubmission.findMany({
          where: { matchId: submission.matchId, status: 'APPROVED' }
        });
  
        if (approvedSubmissions.length === 2) {
          const match = await prisma.match.findUnique({
            where: { id: submission.matchId },
            include: { team1: true, team2: true }
          });
  
          if (match?.team1Id && match?.team2Id) {
            // Team match resolution
            const [team1Sub, team2Sub] = approvedSubmissions;
            const winnerId = (team1Sub.playerScore! > team2Sub.playerScore!) 
              ? match.team1Id 
              : match.team2Id;
  
            await prisma.match.update({
              where: { id: match.id },
              data: { winnerTeamId: winnerId, status: 'COMPLETED' }
            });
          } else {
            // Individual match resolution
            const [p1Sub, p2Sub] = approvedSubmissions;
            const winnerId = (p1Sub.playerScore! > p2Sub.playerScore!) 
              ? match?.player1Id 
              : match?.player2Id;
  
            await prisma.match.update({
              where: { id: match?.id },
              data: { winnerId, status: 'COMPLETED' }
            });
          }
        }
      }
      return updatedSubmission;
    } catch (error) {
      console.error('Decision error:', error);
      throw error;
    }
  }}

export default new scoreSubmissionService();
