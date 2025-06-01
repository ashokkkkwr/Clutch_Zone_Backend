import {Request, Response} from 'express';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();
class Dashboard {
  async getAdminDashboardStats(req: Request, res: Response) {
    try {
      // Get basic counts
      const [
        totalUsers,
        totalGames,
        totalTournaments,
        totalTeams,
        totalMatches,
        // unreadNotifications,
        totalTeamPlayers,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.games.count(),
        prisma.tournament.count(),
        prisma.teams.count(),
        prisma.match.count(),
        // prisma.notification.count({ where: { is_read: false } }),
        prisma.teamPlayers.count(),
      ]);

      // Calculate current week's start (Monday) and end (Sunday) in UTC
      const now = new Date();
      const day = now.getUTCDay(); // Use UTC day (0-6)
      const startOfWeek = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
      );
      startOfWeek.setUTCDate(now.getUTCDate() - (day === 0 ? 6 : day - 1)); // Adjust to Monday
      startOfWeek.setUTCHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6); // Add 6 days to get Sunday
      endOfWeek.setUTCHours(23, 59, 59, 999);

      // Generate all days in the week (Mon to Sun) in UTC
      const daysInWeek = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setUTCDate(startOfWeek.getUTCDate() + i);
        daysInWeek.push({
          date: date,
          name: date.toLocaleDateString('en-US', {
            weekday: 'short',
            timeZone: 'UTC', // Force UTC for name generation
          }),
          users: 0,
        });
      }

      // Fetch user counts per day in the current week
      const userCounts = await prisma.$queryRaw<{day: Date; users: number}[]>`
            SELECT 
              DATE_TRUNC('day', "createdAt") as day,
              COUNT(id)::integer as users
            FROM "user"
            WHERE "createdAt" BETWEEN ${startOfWeek} AND ${endOfWeek}
            GROUP BY day
            ORDER BY day
          `;

      // Map the counts to respective days using UTC dates
      const userCountsMap = new Map();
      userCounts.forEach((entry) => {
        const dayKey = entry.day.toISOString().split('T')[0];
        userCountsMap.set(dayKey, entry.users);
      });

      // Fill in the weekly users data with UTC dates
      const weeklyUsers = daysInWeek.map((day) => {
        const dayKey = day.date.toISOString().split('T')[0];
        return {
          name: day.name,
          users: userCountsMap.get(dayKey) || 0,
        };
      });
      const [upcomingTournaments, completedTournaments] = await Promise.all([
        prisma.tournament.count({
          where: {tournament_start_date: {gt: now}},
        }),
        prisma.tournament.count({
          where: {tournament_end_date: {lt: now}},
        }),
      ]);

      // Group tournaments by game (for a graph of tournaments per game)
      const tournamentsByGame = await prisma.tournament.groupBy({
        by: ['games_id'],
        _count: {games_id: true},
      });

      // Calculate average players per team
      const averagePlayersPerTeam = totalTeams > 0 ? totalTeamPlayers / totalTeams : 0;

      // Group match statuses to show distribution (for graph)
      const scoreSubmissionStatusStats = await prisma.scoreSubmission.groupBy({
        by: ['status'],
        _count: {status: true},
      });

      // Group game favorites per game (to see popularity per game)
      const favoritesByGame = await prisma.game_favaurites.groupBy({
        by: ['game_id'],
        _count: {game_id: true},
      });

      // Group participants by tournament (to get participation numbers)
      const participantsByTournament = await prisma.participant.groupBy({
        by: ['tournamentId'],
        _count: {tournamentId: true},
      });

      // Construct the response object
      const stats = {
        users: {total: totalUsers, weekly: weeklyUsers},
        games: {total: totalGames, favoritesByGame},
        tournaments: {
          total: totalTournaments,
          upcoming: upcomingTournaments,
          completed: completedTournaments,
          tournamentsByGame,
          participantsByTournament,
        },
        teams: {total: totalTeams, averagePlayers: averagePlayersPerTeam},
        matches: {
          total: totalMatches,
          scoreSubmissionStatusDistribution: scoreSubmissionStatusStats,
        },
        // notifications: { unread: unreadNotifications }
      };
      // Send the statistics as a JSON response
      return res.status(200).json({success: true, data: stats});
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      return res.status(500).json({success: false, error: 'Internal server error'});
    }
  }
}
export default new Dashboard();
