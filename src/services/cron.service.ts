// src/services/cron.service.ts
import schedule from 'node-schedule';
import Print from '../utils/print';
import { PrismaClient } from '@prisma/client';
import { io, getSocketIdByUserId } from '../socket/sockets';

const prisma = new PrismaClient();

export class CronService {
  constructor() {
    this.initializeJobs();
  }
  private initializeJobs() {
    // Run every minute to check for matches that have ended.
    schedule.scheduleJob('* * * * *', async () => {
      await this.checkForEndedMatches();
    });

    // Schedule existing match reminders on startup.
    this.scheduleExistingMatchReminders().catch((error: any) => {
      Print.error('[CRON] Error scheduling existing match reminders:', error);
    });
  }

  private async scheduleExistingMatchReminders() {
    try {
      const upcomingMatches = await prisma.match.findMany({
        where: {
          match_time: { gt: new Date() },
        },
        select: {
          id: true,
          match_time: true,
        },
      });
      console.log(
        "🚀 ~ CronService ~ scheduleExistingMatchReminders ~ upcomingMatches:",
        upcomingMatches
      );
      upcomingMatches.forEach((match) => {
        this.scheduleReminderForMatch(match.id, match.match_time!);
      });
    } catch (error: any) {
      Print.error('Error scheduling existing match reminders:', error);
    }
  }

  public scheduleReminderForMatch(matchId: number, matchTime: Date) {
    const reminderTime = new Date(matchTime.getTime() - 5 * 60 * 1000);
    if (reminderTime < new Date()) {
      return;
    }
    schedule.scheduleJob(reminderTime, async () => {
      Print.info(`[CRON] 5 minutes reminder for match ${matchId}`);

      // Retrieve full match details including team and player fields.
      const matchDetails = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
          team1: true,
          team2: true,
          player1: true,
          player2: true,
          tournament: true,
        },
      });

      if (!matchDetails) {
        console.error(`[CRON] Match not found for id ${matchId}`);
        return;
      }

      // Helper function to create a notification.
      const createNotificationForUser = async (userId: number, message: string) => {
        const data = await prisma.notification.create({
          data: {
            userId,
            message,
            type: 'MATCH_STARTING', // Should match a valid NotificationType enum value.
            relatedMatchId: matchId,
          },
          include: {
            tournament: true,
            match: true,
          },
        });
        const socketId = await getSocketIdByUserId(userId.toString());
        if (socketId) {
          io.to(socketId).emit('notification', data);
        }
      };

      // Send notifications to team leaders or individual players.
      if (matchDetails.team1Id || matchDetails.team2Id) {
        if (matchDetails.team1Id) {
          const team1Leader = await prisma.teamPlayers.findFirst({
            where: { team_id: matchDetails.team1Id, role: 'TEAM_LEADER' },
          });
          if (team1Leader) {
            await createNotificationForUser(
              team1Leader.user_id,
              `Reminder: Match ${matchId} for your team is starting in 5 minutes.`
            );
          }
        }
        if (matchDetails.team2Id) {
          const team2Leader = await prisma.teamPlayers.findFirst({
            where: { team_id: matchDetails.team2Id, role: 'TEAM_LEADER' },
          });
          if (team2Leader) {
            await createNotificationForUser(
              team2Leader.user_id,
              `Reminder: Match ${matchId} for your team is starting in 5 minutes.`
            );
          }
        }
      } else {
        if (matchDetails.player1Id) {
          await createNotificationForUser(
            matchDetails.player1Id,
            `Reminder: Your match ${matchId} is starting in 5 minutes.`
          );
        }
        if (matchDetails.player2Id) {
          await createNotificationForUser(
            matchDetails.player2Id,
            `Reminder: Your match ${matchId} is starting in 5 minutes.`
          );
        }
      }
    });
  }

  private async checkForEndedMatches() {
    try {
      const pendingMatches = await prisma.match.findMany({
        where: {
          status: { not: 'COMPLETED' },
          match_time: { not: null },
        },
      });
      const now = new Date();
  
      for (const match of pendingMatches) {
        const tournament = await prisma.tournament.findUnique({
          where: { id: match.tournamentId },
        });
        if (!tournament || !match.match_time) continue;
  
        // Only process elimination matches (non–points based).
        if (tournament.is_points_based) continue;
  
        // Calculate match end time from scheduled match_time and interval.
        const matchEndTime = new Date(
          match.match_time.getTime() + tournament.match_interval * 60 * 1000
        );
  
        // If current time is past the match's end time, decide the winner.
        if (now >= matchEndTime) {
          Print.info(`[CRON] Checking match ${match.id} ended at ${matchEndTime}`);
  
          // Retrieve approved submissions for the match.
          const submissions = await prisma.scoreSubmission.findMany({
            where: { matchId: match.id, status: 'APPROVED' },
          });
  
          if (submissions.length === 0) {
            // No submission: Choose a random winner.
            if (match.player1Id && match.player2Id) {
              const players = [match.player1Id, match.player2Id];
              const randomIndex = Math.floor(Math.random() * players.length);
              const randomWinnerId = players[randomIndex];
              await prisma.match.update({
                where: { id: match.id },
                data: {
                  winnerId: randomWinnerId,
                  status: "COMPLETED",
                },
              });
              Print.info(
                `[CRON] No submission: Randomly selected player ${randomWinnerId} as winner for match ${match.id}`
              );
            } else if (match.team1Id && match.team2Id) {
              const teams = [match.team1Id, match.team2Id];
              const randomIndex = Math.floor(Math.random() * teams.length);
              const randomTeamWinner = teams[randomIndex];
              await prisma.match.update({
                where: { id: match.id },
                data: {
                  winnerTeamId: randomTeamWinner,
                  status: "COMPLETED",
                },
              });
              Print.info(
                `[CRON] No submission: Randomly selected team ${randomTeamWinner} as winner for match ${match.id}`
              );
            }
          } else if (submissions.length === 1) {
            // One submission: That submitter is declared the winner.
            const submission = submissions[0];
            if (match.player1Id && match.player2Id) {
              const winnerId = [match.player1Id, match.player2Id].includes(
                submission.submittedBy
              )
                ? submission.submittedBy
                : match.player1Id;
              await prisma.match.update({
                where: { id: match.id },
                data: {
                  winnerId,
                  status: "COMPLETED",
                },
              });
              Print.info(
                `[CRON] One submission: Declared player ${winnerId} as winner for match ${match.id}`
              );
            } else if (match.team1Id && match.team2Id) {
              const teamWinner = submission.teamId;
              if (teamWinner) {
                await prisma.match.update({
                  where: { id: match.id },
                  data: {
                    winnerTeamId: teamWinner,
                    status: "COMPLETED",
                  },
                });
                Print.info(
                  `[CRON] One submission: Declared team ${teamWinner} as winner for match ${match.id}`
                );
              }
            }
          } else {
            // If multiple submissions exist, assume the winner has already been determined.
            Print.info(
              `[CRON] Match ${match.id} has multiple submissions; assuming winner already decided.`
            );
          }
  
          // After processing the match, check if the entire current round is complete.
          const currentRound = match.round;
          const tournamentId = match.tournamentId;
          const incompleteMatches = await prisma.match.findMany({
            where: {
              tournamentId,
              round: currentRound,
              status: { not: 'COMPLETED' },
            },
          });
  
          if (incompleteMatches.length === 0) {
            // Retrieve all matches for the current round.
            const currentRoundMatches = await prisma.match.findMany({
              where: { tournamentId, round: currentRound },
              orderBy: { position: 'asc' },
            });
            
            // Determine if this round is for team-based matches.
            const isTeamMatch = currentRoundMatches[0]?.team1Id !== null;
            // Extract winners from the current round.
            const winners = currentRoundMatches
              .map((m) => (isTeamMatch ? m.winnerTeamId : m.winnerId))
              .filter((w): w is number => w !== null);
            
            const nextRoundNumber = currentRound + 1;
            const nextRoundMatches = await prisma.match.findMany({
              where: { tournamentId, round: nextRoundNumber },
              orderBy: { position: 'asc' },
            });
  
            if (nextRoundMatches.length > 0) {
              // Update next round matches with winners.
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
            } else if (winners.length === 2) {
              // No existing matches in next round: Create a new (final) match.
              await prisma.match.create({
                data: {
                  tournamentId,
                  round: nextRoundNumber,
                  position: 0,
                  status: 'SCHEDULED',
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
              // *** Final step: If there's only one winner from the current round,
              // that means the final match has been played and decided.
              // Update the tournament record with the winner and mark it as COMPLETED.
              await prisma.tournament.update({
                where: { id: tournamentId },
                data: {
                  winnerId: winners[0],
                  status: "COMPLETED",
                },
              });
              Print.info(
                `[CRON] Tournament ${tournamentId} completed. Final winner: ${winners[0]}`
              );
            }
          }
        }
      }
    } catch (error) {
      console.log("🚀 ~ CronService ~ checkForEndedMatches ~ error:", error);
    }
  }
  
}
