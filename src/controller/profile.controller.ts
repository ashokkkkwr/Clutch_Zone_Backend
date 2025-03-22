import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: {
        in_game_ids: {
          include: { game: true }
        },
        tournament: {
          where: { winnerId: Number(userId) }
        },
        participants: {
          include: {
            tournament: {
              include: { games: true }
            }
          }
        },
        teamPlayers: {
          include: {
            team: {
              include: {
                matchesAsTeam1: true,
                matchesAsTeam2: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate player stats
    const totalMatches = user.participants.length;
    const winRate = totalMatches > 0 ? (user.wins / totalMatches * 100) : 0;

    // Process achievements
    const achievements = user.tournament.map(t => ({
      title: `Tournament Champion - ${t.tournament_name}`,
      date: t.tournament_start_date.toISOString().split('T')[0],
      description: `Won the ${t.tournament_name} tournament`,
      xp: 1500
    }));

    // Process match history
    const matchHistory = user.participants.map(p => ({
      game: p.tournament.games.game_name,
      result: p.tournament.winnerId === Number(userId) ? 'Victory' : 'Loss',
      kills: Math.floor(Math.random() * 20) + 1, // Example random data
      placement: Math.floor(Math.random() * 10) + 1,
      date: p.tournament.tournament_start_date.toISOString(),
      xp: 250,
      mvp: Math.random() > 0.5
    }));

    const profileData = {
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        xp: user.xp,
        level: Math.floor(user.xp / 1000),
        currentLevelXP: user.xp % 1000,
        clutchBucks: user.clutch_bucks,
        wins: user.wins,
        tournamentsPlayed: user.tournaments_played,
        stats: {
          winRate: winRate.toFixed(1),
          kdRatio: (Math.random() * 5).toFixed(1),
          totalMatches,
          coins: user.clutch_bucks
        },
        inGameIds: user.in_game_ids,
        achievements,
        matchHistory
      }
    };
console.log('profile data',profileData)
    res.json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};