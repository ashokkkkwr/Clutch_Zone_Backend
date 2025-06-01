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
  async  giveDecision(submissionId: any, decision: any, userId: any) {
    try {
      // (Retrieval of submission, match, admin check, etc.)
      const submission = await prisma.scoreSubmission.findUnique({
        where: { id: Number(submissionId) },
        include: { match: { include: { tournament: true } } },
      });
      if (!submission) {
        throw HttpException.badRequest(`Submission not found...`);
      }
      const match = await prisma.match.findUnique({
        where: { id: submission.matchId },
      });
      if (!match) {
        throw HttpException.badRequest(`Match not found...`);
      }
      
      // Admin check.
      const isAdmin = await prisma.user.findUnique({
        where: { id: Number(userId) },
      });
      if (isAdmin?.role !== "ADMIN") {
        throw HttpException.badRequest(`You are not authorized to perform this action...`);
      }
      
      // Update the submission status.
      const updatedSubmission = await prisma.scoreSubmission.update({
        where: { id: Number(submissionId) },
        data: { status: decision },
      });
      
      // Process approved submissions.
      if (decision === "APPROVED") {
        // Handle points-based tournaments.
        if (submission.match.tournament.is_points_based) {
          let participant;
          if (submission.isTeam) {
            participant = await prisma.participant.findFirst({
              where: {
                tournamentId: submission.match.tournamentId,
                teamId: submission.teamId,
              },
            });
          } else {
            participant = await prisma.participant.findFirst({
              where: {
                tournamentId: submission.match.tournamentId,
                userId: submission.submittedBy,
              },
            });
          }
          if (participant) {
            await prisma.participant.update({
              where: { id: participant.id },
              data: { points: { increment: submission.playerScore || 0 } },
            });
          }
        }
        
        // Handle elimination tournaments.
        const approvedSubmissions = await prisma.scoreSubmission.findMany({
          where: { matchId: submission.matchId, status: "APPROVED" },
        });
        
        if (approvedSubmissions.length === 2) {
          // Get match details including participants.
          const resolvedMatch = await prisma.match.findUnique({
            where: { id: submission.matchId },
            include: { team1: true, team2: true },
          });
          
          // Determine if this is a team or individual match.
          const isTeamMatch = resolvedMatch?.team1Id && resolvedMatch?.team2Id ? true : false;
          let winnerId;
          if (isTeamMatch) {
            const [team1Sub, team2Sub] = approvedSubmissions;
            winnerId = team1Sub.playerScore! > team2Sub.playerScore!
              ? resolvedMatch?.team1Id
              : resolvedMatch?.team2Id;
            await prisma.match.update({
              where: { id: resolvedMatch!.id },
              data: { winnerTeamId: winnerId, status: "COMPLETED" },
            });
          } else {
            const [p1Sub, p2Sub] = approvedSubmissions;
            winnerId = p1Sub.playerScore! > p2Sub.playerScore!
              ? resolvedMatch?.player1Id
              : resolvedMatch?.player2Id;
            await prisma.match.update({
              where: { id: resolvedMatch!.id },
              data: { winnerId, status: "COMPLETED" },
            });
          }
        }
        
        // After marking the match as COMPLETED, check if the entire round is finished.
        const currentRound = match.round;
        const tournamentId = match.tournamentId;
        
        // Find any matches in the current round that have not been completed.
        const incompleteMatches = await prisma.match.findMany({
          where: {
            tournamentId,
            round: currentRound,
            status: { not: "COMPLETED" },
          },
        });
        
        if (incompleteMatches.length === 0) {
          // Retrieve all matches for this round.
          const currentRoundMatches = await prisma.match.findMany({
            where: {
              tournamentId,
              round: currentRound,
            },
            orderBy: { position: "asc" },
          });
          
          // Determine if the match is team-based.
          const isTeamMatch = currentRoundMatches[0].team1Id !== null;
          
          // Extract winners from all matches in the current round.
          // (For individual tournaments, winners will be user IDs; for team tournaments, they will be team IDs.)
          const winners = currentRoundMatches
            .map((m) => (isTeamMatch ? m.winnerTeamId : m.winnerId))
            .filter((w): w is number => w !== null);
          
          // Check if any next round matches exist.
          const nextRoundNumber = currentRound + 1;
          const nextRoundMatches = await prisma.match.findMany({
            where: {
              tournamentId,
              round: nextRoundNumber,
            },
            orderBy: { position: "asc" },
          });
          
          if (nextRoundMatches.length > 0) {
            // Update existing next round matches with the winners from the current round.
            for (let i = 0; i < nextRoundMatches.length; i++) {
              const updateData = isTeamMatch
                ? {
                    team1Id: winners[i * 2] || null,
                    team2Id: winners[i * 2 + 1] || null,
                  }
                : {
                    player1Id: winners[i * 2] || null,
                    player2Id: winners[i * 2 + 1] || null,
                  };
              await prisma.match.update({
                where: { id: nextRoundMatches[i].id },
                data: updateData,
              });
            }
          } else {
            // When no next round matches exist, two possibilities exist:
            // 1. The winners array has length 2, meaning the final match is yet to be scheduled.
            //    In that case, you could choose to create a final match.
            // 2. The winners array has length 1, indicating that the last (final) match has completed.
            if (winners.length === 2) {
              // Create a match for the final round.
              await prisma.match.create({
                data: {
                  tournamentId,
                  round: nextRoundNumber,
                  position: 0,
                  status: "SCHEDULED",
                  ...(isTeamMatch
                    ? {
                        team1Id: winners[0],
                        team2Id: winners[1],
                      }
                    : {
                        player1Id: winners[0],
                        player2Id: winners[1],
                      }),
                },
              });
            } else if (winners.length === 1) {
              // *** This is the key change: the final match has been completed.
              // Update the tournament winner accordingly. You update the tournament's `winnerId`
              // (which relates to a user for individual tournaments or—depending on your design—the winning team).
              // Also, mark the tournament status as COMPLETED.
              await prisma.tournament.update({
                where: { id: tournamentId },
                data: { winnerId: winners[0], status: "COMPLETED" },
              });
            }
          }
        }
      }
      return updatedSubmission;
    } catch (error) {
      console.error("Decision error:", error);
      throw error;
    }
  }
  
}
  

export default new scoreSubmissionService();
