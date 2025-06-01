import HttpException from "../utils/HttpException.utils";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class LeaderBoardService {
    async getLeaderBoard() {
        try {
            // Points-based leaderboards
            const userPoints = await prisma.participant.groupBy({
                by: ['userId'],
                where: {
                    tournament: { is_points_based: true },
                    userId: { not: null }
                },
                _sum: { points: true },
                orderBy: { _sum: { points: 'desc' } },
                take: 10
            });

            const teamPoints = await prisma.participant.groupBy({
                by: ['teamId'],
                where: {
                    tournament: { is_points_based: true },
                    teamId: { not: null }
                },
                _sum: { points: true },
                orderBy: { _sum: { points: 'desc' } },
                take: 10
            });

            // Solo wins
            const soloWins = await prisma.tournament.groupBy({
                by: ['winnerId'],
                where: {
                    tournament_game_mode: 'solo',
                    winnerId: { not: null }
                },
                _count: { winnerId: true },
                orderBy: { _count: { winnerId: 'desc' } },
                take: 10
            });

            // Team-based wins (duo/squad)
            const teamTournaments = await prisma.tournament.findMany({
                where: {
                    tournament_game_mode: { in: ['duo', 'squad'] },
                    status: 'COMPLETED'
                },
                include: {
                    matches: {
                        orderBy: { round: 'desc' },
                        take: 1
                    }
                }
            });

            const duoWinsMap = new Map<number, number>();
            const squadWinsMap = new Map<number, number>();

            for (const tournament of teamTournaments) {
                const finalMatch = tournament.matches[0];
                if (finalMatch?.winnerTeamId) {
                    const map = tournament.tournament_game_mode === 'duo'
                        ? duoWinsMap
                        : squadWinsMap;
                    const count = map.get(finalMatch.winnerTeamId) || 0;
                    map.set(finalMatch.winnerTeamId, count + 1);
                }
            }

            // Most kills
            const userKills = await prisma.scoreSubmission.groupBy({
                by: ['submittedBy'],
                where: {
                    status: 'APPROVED',
                    isTeam: false
                },
                _sum: { kills: true },
                orderBy: { _sum: { kills: 'desc' } },
                take: 10
            });

            const teamKills = await prisma.scoreSubmission.groupBy({
                by: ['teamId'],
                where: {
                    status: 'APPROVED',
                    isTeam: true,
                    teamId: { not: null }
                },
                _sum: { kills: true },
                orderBy: { _sum: { kills: 'desc' } },
                take: 10
            });

            // Most matches played
            const userMatches = await prisma.participant.groupBy({
                by: ['userId'],
                where: { userId: { not: null } },
                _count: { userId: true },
                orderBy: { _count: { userId: 'desc' } },
                take: 10
            });

            const teamMatches = await prisma.participant.groupBy({
                by: ['teamId'],
                where: { teamId: { not: null } },
                _count: { teamId: true },
                orderBy: { _count: { teamId: 'desc' } },
                take: 10
            });

            // Fetch details for all sections
            const getUserDetails = async (userId: number) => {
                return prisma.user.findUnique({
                    where: { id: userId },
                    select: { username: true, avatar: true }
                });
            };

            const getTeamDetails = async (teamId: number) => {
                return prisma.teams.findUnique({
                    where: { id: teamId },
                    select: { team_name: true, logo: true }
                });
            };

            return {
                pointsBased: {
                    users: await Promise.all(userPoints.map(async (entry) => ({
                        ...(await getUserDetails(entry.userId!)),
                        points: entry._sum.points || 0
                    }))),
                    teams: await Promise.all(teamPoints.map(async (entry) => ({
                        ...(await getTeamDetails(entry.teamId!)),
                        points: entry._sum.points || 0
                    })))
                },
                mostWins: {
                    solo: await Promise.all(soloWins.map(async (entry) => ({
                        ...(await getUserDetails(entry.winnerId!)),
                        wins: entry._count.winnerId
                    }))),
                    duo: await Promise.all(
                        Array.from(duoWinsMap.entries())
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 10)
                            .map(async ([teamId, wins]) => ({
                                ...(await getTeamDetails(teamId)),
                                wins
                            }))
                    ),
                    squad: await Promise.all(
                        Array.from(squadWinsMap.entries())
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 10)
                            .map(async ([teamId, wins]) => ({
                                ...(await getTeamDetails(teamId)),
                                wins
                            }))
                    )
                },
                mostKills: {
                    users: await Promise.all(userKills.map(async (entry) => ({
                        ...(await getUserDetails(entry.submittedBy)),
                        kills: entry._sum.kills || 0
                    }))),
                    teams: await Promise.all(teamKills.map(async (entry) => ({
                        ...(await getTeamDetails(entry.teamId!)),
                        kills: entry._sum.kills || 0
                    })))
                },
                mostMatchesPlayed: {
                    users: await Promise.all(userMatches.map(async (entry) => ({
                        ...(await getUserDetails(entry.userId!)),
                        matches: entry._count.userId
                    }))),
                    teams: await Promise.all(teamMatches.map(async (entry) => ({
                        ...(await getTeamDetails(entry.teamId!)),
                        matches: entry._count.teamId
                    })))
                }
            };
        } catch (error) {
            console.error(error);
            throw  HttpException.internalServerError( "Error fetching leaderboard data");
        }}}
export default new LeaderBoardService();