import HttpException from '../utils/HttpException.utils';
import {BracketsManager} from 'brackets-manager';
import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();
const storage = new (require('brackets-json-db').JsonDatabase)();
const manager = new BracketsManager(storage);
class TournamentService {
  async createTournament(
    tournament_icon: string,
    tournament_cover: string,
    tournament_name: string,
    tournament_description: string,
    tournament_entry_fee: string,
    tournament_start_date: Date,
    tournament_end_date: Date,
    tournament_registration_start_date: Date,
    tournament_registration_end_date: Date,
    tournament_game_mode: string,
    tournament_streaming_link: string,
    games_id: string,
    //minimum numbher of players like 16 8 4 or 2 players
    total_player: string,
    prizePools?: any,
    is_points_based?: boolean,
    totalRounds?: number,
  ) {
    console.log(is_points_based, '---------------------------------');
    console.log(totalRounds, '---------------------------------');

    console.log('🚀 ~ TournamentService ~ prizePools:', prizePools);
    try {
    } catch (error) {}
    console.log('🚀 ~ TournamentService ~ total_player:', total_player);
    const validPlayers = [2, 4, 8, 16, 32];
    tournament_registration_start_date = new Date(tournament_registration_start_date);
    tournament_registration_end_date = new Date(tournament_registration_end_date);
    tournament_start_date = new Date(tournament_start_date);
    tournament_end_date = new Date(tournament_end_date);
    if (!is_points_based) {
      if (!validPlayers.includes(parseInt(total_player))) {
        throw HttpException.badRequest(
          `Invalid total players. Must be one of ${validPlayers.join(', ')}`,
        );
      }
    }
    try {
      const tournament = await prisma.tournament.create({
        data: {
          tournament_name,
          tournament_icon,
          tournament_cover,
          tournament_description,
          tournament_entry_fee: parseInt(tournament_entry_fee),
          // tournament_registration_start_date: new Date("2025-02-20T21:07").toISOString(),

          tournament_registration_start_date,
          tournament_registration_end_date,

          tournament_game_mode,
          tournament_streaming_link,
          games_id: parseInt(games_id),
          total_player: parseInt(total_player),
          is_points_based: is_points_based?.toString() === 'true',
          total_rounds: Number(totalRounds),
          tournament_start_date,
          tournament_end_date,
        },
      });
      console.log('🚀 ~ TournamentService ~ tournament:', tournament);
      const rightnow = await prisma.tournament.findUnique({
        where: {
          id: tournament.id,
        },
      });
      console.log('🚀 ~ TournamentService ~ rightnow:', rightnow);
      //Create prizePools if provided
      if (prizePools && prizePools.length > 0) {
        console.log('ya saman?');
        console.log(prizePools, 'present data');
        // Validate each prize pool entry
        for (const pool of prizePools) {
          console.log(pool.prize);
          const prize = parseInt(pool.prize.trim());
          const placement = parseInt(pool.placements.trim());

          if (isNaN(prize) || prize <= 0) {
            throw HttpException.badRequest('Invalid prize amount');
          }
          if (isNaN(placement) || placement <= 0) {
            throw HttpException.badRequest('Invalid placement');
          }
        }
        // Create prize pools
        await prisma.prize_pool.createMany({
          data: prizePools.map((pool: {prize: string; placements: string}) => ({
            prize: parseInt(pool.prize),
            placements: parseInt(pool.placements),
            tournament_id: tournament.id,
          })),
        });
      }
      return tournament;
    } catch (error) {
      console.log('🚀 ~ TournamentService ~ error:', error);
      throw HttpException.internalServerError('Something went wrong');
    }
  }
  async getTournaments() {
    console.log('ya ta xa ta');

    const tournaments = await prisma.tournament.findMany({
      include: {
        games: true,
      },
    });

    console.log('🚀 ~ TournamentService ~ getTournaments ~ tournaments:', tournaments);
    return tournaments;
  }
  async getUpcommingTournaments() {
    const currentDate = new Date(); // Get current date as Date object
    console.log('🚀 ~ TournamentService ~ getUpcommingTournaments ~ currentDate:', currentDate);

    const tournaments = await prisma.tournament.findMany({
      where: {
        tournament_registration_start_date: {
          gt: currentDate,
        },
      },
      include: {
        games: true,
      },
    });
    console.log('🚀 ~ TournamentService ~ getUpcommingTournaments ~ tournaments:', tournaments);
    return tournaments;
  }
  async getOngoingTournaments() {
    const currentDate = new Date(); // Get current date as Date object
    const tournaments = await prisma.tournament.findMany({
      where: {
        AND: [
          {tournament_registration_start_date: {lte: currentDate}},
          {tournament_end_date: {gte: currentDate}},
        ],
      },
      include: {
        games: true,
      },
    });
    console.log('🚀 ~ TournamentService ~ getOngoingTOurnaments ~ tournaments:', tournaments);
    return tournaments;
  }
  async getPastTournaments() {
    const currentDate = new Date(); // Get current date as Date object
    console.log('🚀 ~ TournamentService ~ getPastTournaments ~ currentDate:', currentDate);

    const tournaments = await prisma.tournament.findMany({
      where: {
        tournament_end_date: {
          lt: currentDate, // Prisma automatically handles date comparison correctly
        },
      },
      include: {
        games: true,
      },
    });
    console.log('🚀 ~ TournamentService ~ getPastTournaments ~ tournaments:', tournaments);
    const tournament = await prisma.tournament.findMany({
      include: {
        games: true,
      },
    });
    console.log('🚀 ~ TournamentService ~ getTournament ~ tournaments:', tournament);
    return tournaments;
  }

  async getTournament(id: string) {
    console.log('ya ta xa ta');
    const tournament = await prisma.tournament.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        games: true,
        prize_pools: true,
      },
    });
    if (tournament) {
      console.log('ya?');
      tournament.prize_pools = tournament.prize_pools || []; // Ensure it's not null
    }
    console.log('🚀 ~ TournamentService ~ getTournament ~ tournament:', tournament);
    return tournament;
  }
  async deleteTournament(id: string) {
    console.log('🚀 ~ TournamentService ~ deleteTournament ~ id:', id);
    const tournamentId = parseInt(id);

    // Delete matches related to the tournament
    await prisma.match.deleteMany({
      where: {tournamentId: tournamentId},
    });

    await prisma.participant.deleteMany({
      where: {tournamentId: tournamentId},
    });

    await prisma.prize_pool.deleteMany({
      where: {tournament_id: tournamentId},
    });

    await prisma.tournament_history.deleteMany({
      where: {tournamentId: tournamentId},
    });

    await prisma.bracket.deleteMany({
      where: {tournamentId: tournamentId},
    });

    const tournament = await prisma.tournament.delete({
      where: {id: tournamentId},
    });

    return tournament;
  }

  async getTournamentBracket(tournamentId: number) {
    console.log('🚀 ~ TournamentService ~ getTournamentBracket ~ tournamentId:', tournamentId);
    const tournament = await prisma.tournament.findUnique({
      where: {id: tournamentId},
      include: {matches: true},
    });

    if (!tournament) throw HttpException.notFound('Tournament not found.');

    if (tournament.is_points_based) {
      const leaderboard = await this.getLeaderboard(tournamentId.toString());
      return {leaderboard, isPointsBased: true};
    }
    const bracket = await prisma.tournament.findUnique({
      where: {id: tournamentId},
      include: {
        matches: {
          include: {
            player1: true,
            player2: true,
            winner: true,
            team1: true,
            team2: true,
            winnerTeam: true,
          },
          orderBy: [{round: 'asc'}, {position: 'asc'}],
        },
        participants: {
          include: {user: true, team: true},
          orderBy: {seed: 'asc'},
        },
      },
    });

    if (!bracket) {
      throw HttpException.notFound('Tournament not found.');
    }

    // Determine if the tournament is team-based
    const isTeamTournament = bracket.participants.some((p) => p.team !== null);

    // Check for empty slots based on tournament type
    let hasEmptySlots;
    if (isTeamTournament) {
      hasEmptySlots = bracket.matches.some((match) => !match.team1Id || !match.team2Id);
    } else {
      hasEmptySlots = bracket.matches.some((match) => !match.player1Id || !match.player2Id);
    }

    if (hasEmptySlots) {
      return {
        ...bracket,
        isDraft: true,
        isTeamTournament,
        message: 'Some slots are empty. Displaying draft bracket.',
      };
    }

    return {
      ...bracket,
      isTeamTournament,
    };
  }
  async getLeaderboard(tournamentId: string) {
    console.log('ya xiro ni ta');
    const tournament = await prisma.tournament.findUnique({
      where: {id: Number(tournamentId)},
      include: {participants: {include: {user: true, team: true}}},
    });

    if (!tournament) throw HttpException.notFound('Tournament not found');

    const isTeamTournament = tournament.participants.some((p) => p.teamId !== null);

    const leaderboard = await prisma.participant.findMany({
      where: {tournamentId: Number(tournamentId)},
      orderBy: {points: 'desc'},
      include: {user: true, team: true},
    });

    return leaderboard.map((p) => ({
      id: isTeamTournament ? p.teamId : p.userId,
      name: isTeamTournament ? p.team?.team_name : p.user?.username,
      points: p.points,
    }));
  }
  async registerTournament(user_id: string, tournament_id: string) {
    const tournament = await prisma.tournament.findUnique({
      where: {
        id: Number(tournament_id),
      },
      include: {participants: true},
    });
    console.log('🚀 ~ TournamentService ~ returnprisma.$transaction ~ tournament:', tournament);
    if (!tournament) throw HttpException.notFound('Tournament not found.');

    const gameMode = tournament.tournament_game_mode.toLocaleLowerCase();
    const isSolo = gameMode === 'solo';
    const isTeam = ['duo', 'squad'].includes(gameMode);
    if (isTeam) {
      return this.handleTeamRegistration(user_id, tournament);
    }

    //handle solo registration
    if (isSolo) {
      if (tournament.participants.length >= tournament.total_player) {
        throw HttpException.badRequest('Tournament is full');
      }
      const ifExists = await prisma.participant.findFirst({
        where: {
          userId: Number(user_id),
          tournamentId: Number(tournament_id),
        },
      });
      console.log('🚀 ~ TournamentService ~ returnprisma.$transaction ~ ifExists:', ifExists);
      if (ifExists) {
        throw HttpException.internalServerError('Already registered');
      }
      const participant = await prisma.participant.create({
        data: {
          userId: Number(user_id),
          tournamentId: Number(tournament_id),
          seed: tournament.participants.length + 1,
        },
      });
      console.log('🚀 ~ TournamentService ~ returnprisma.$transaction ~ participant:', participant);
      if (
        tournament.participants.length + 1 === tournament.total_player &&
        tournament.is_points_based
      ) {
        console.log('point based ma xa');
        await this.initializePointsBasedMatches(tournament.id.toString(), tournament.total_rounds!);
      }
      if (
        tournament.participants.length + 1 === tournament.total_player &&
        !tournament.is_points_based
      ) {
        console.log('point based ma xaina');
        await this.initializeMatches(tournament_id);
      }
      return;
    }
  }
  private async handleTeamRegistration(user_id: string, tournament: any) {
    const gameMode = tournament.tournament_game_mode.toLowerCase();

    const validGameModes = ['duo', 'squad'] as const;
    console.log(
      '🚀 ~ TournamentService ~ handleTeamRegistration ~ validGameModes:',
      validGameModes,
    );

    if (!validGameModes.includes(gameMode as any)) {
      throw new Error('Invalid game mode');
    }

    const requiredPlayers = gameMode === 'duo' ? 2 : 4;
    console.log(
      '🚀 ~ TournamentService ~ handleTeamRegistration ~ requiredPlayers:',
      requiredPlayers,
    );
    //verify team ownership
    // Verify team leadership and get team ID
    const teamLeader = await prisma.teamPlayers.findFirst({
      where: {
        user_id: Number(user_id),
        role: 'TEAM_LEADER',
      },
    });
    console.log('🚀 ~ TournamentService ~ handleTeamRegistration ~ teamLeader:', teamLeader);

    if (!teamLeader) {
      throw HttpException.badRequest('You are not a team leader.');
    }
    const teamId = teamLeader.team_id;
    console.log('🚀 ~ TournamentService ~ handleTeamRegistration ~ teamId:', teamId);

    // Check team member count
    const teamMembersCount = await prisma.teamPlayers.count({
      where: {team_id: teamId},
    });
    console.log(
      '🚀 ~ TournamentService ~ handleTeamRegistration ~ teamMembersCount:',
      teamMembersCount,
    );
    if (teamMembersCount !== requiredPlayers) {
      console.log(
        '🚀 ~ TournamentService ~ handleTeamRegistration ~ requiredPlayers:',
        requiredPlayers,
      );
      console.log(
        '🚀 ~ TournamentService ~ handleTeamRegistration ~ teamMembersCount:',
        teamMembersCount,
      );
      console.log('yoyo');
      throw HttpException.badRequest(`Team requires exactly ${requiredPlayers} members`);
    }

    // Check existing team registration
    const existingRegistration = await prisma.participant.findFirst({
      where: {
        tournamentId: tournament.id,
        teamId: teamId,
      },
    });
    console.log(
      '🚀 ~ TournamentService ~ handleTeamRegistration ~ existingRegistration:',
      existingRegistration,
    );

    if (existingRegistration) {
      throw HttpException.badRequest('Team already registered');
    }

    // Check tournament capacity
    const teamParticipants = await prisma.participant.count({
      where: {tournamentId: tournament.id},
    });
    console.log(
      '🚀 ~ TournamentService ~ handleTeamRegistration ~ teamParticipants:',
      teamParticipants,
    );

    if (teamParticipants >= tournament.total_player) {
      console.log(
        '🚀 ~ TournamentService ~ handleTeamRegistration ~ teamParticipants:',
        teamParticipants,
      );
      throw HttpException.badRequest('Tournament is full');
    }
    // Register the team
    await prisma.participant.create({
      data: {
        teamId: teamId,
        tournamentId: tournament.id,
        seed: teamParticipants + 1,
      },
    });

    if (teamParticipants + 1 === tournament.total_player) {
      await this.initializeTeamMatches(tournament.id.toString());
    }
  }
  private async initializePointsBasedMatches(tournamentId: string, totalRounds: number) {
    const tournament = await prisma.tournament.findUnique({
      where: {id: Number(tournamentId)},
      include: {participants: {include: {user: true, team: true}}},
    });

    if (!tournament) throw HttpException.badRequest('Tournament not found');

    const isTeamTournament = tournament.participants.some((p) => p.teamId !== null);
    const matchesData: any[] = [];

    for (let round = 1; round <= totalRounds; round++) {
      tournament.participants.forEach((participant) => {
        const matchData: any = {
          tournamentId: tournament.id,
          round,
          position: participant.id, // Unique per round
          match_time: tournament.tournament_start_date,
        };
        if (isTeamTournament) {
          matchData.team1Id = participant.teamId!;
        } else {
          matchData.player1Id = participant.userId!;
        }
        matchesData.push(matchData);
      });
    }

    await prisma.match.createMany({data: matchesData});
    console.log('Points-based matches initialized.');
  }

  private async initializeTeamMatches(tournamentId: string) {
    const tournament = await prisma.tournament.findUnique({
      where: {id: Number(tournamentId)},
      include: {participants: {include: {team: true}}},
    });
    if (!tournament) {
      throw HttpException.badRequest('Tournament not found');
    }

    const teamIds = tournament.participants.map((p) => p.teamId).filter(Boolean) as number[];
    // Shuffle teams
    for (let i = teamIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [teamIds[i], teamIds[j]] = [teamIds[j], teamIds[i]];
    }

    const matchesData = [];
    const matchTime = new Date(tournament.tournament_start_date);

    // Create first round matches
    for (let i = 0; i < teamIds.length; i += 2) {
      matchesData.push({
        tournamentId: tournament.id,
        match_time: matchTime,
        round: 1,
        position: i / 2,
        team1Id: teamIds[i],
        team2Id: teamIds[i + 1] || null,
      });
    }

    // Create placeholder matches for future rounds
    const totalRounds = Math.log2(tournament.total_player);
    for (let round = 2; round <= totalRounds; round++) {
      const numMatches = tournament.total_player / Math.pow(2, round);
      for (let pos = 0; pos < numMatches; pos++) {
        matchesData.push({
          tournamentId: Number(tournamentId),
          round,
          position: pos,
        });
      }
    }

    await prisma.match.createMany({data: matchesData});
  }
  private async initializeMatches(tournamentId: string) {
    try {
      console.log('Initializing matches...');

      const tournament = await prisma.tournament.findUnique({
        where: {id: Number(tournamentId)},
        include: {participants: true, matches: true},
      });

      if (!tournament) {
        throw HttpException.notFound('Tournament not found.');
      }
      // Check if matches already exist
      if (tournament.matches.length > 0) {
        console.log('Matches already initialized. Skipping...');
        return;
      }
      let players = tournament.participants.map((p) => p.userId);

      // Fisher-Yates Shuffle Algorithm for Randomizing Players
      for (let i = players.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [players[i], players[j]] = [players[j], players[i]];
      }

      console.log('🚀 ~ TournamentService ~ initializeMatches ~ shuffledPlayers:', players);

      const totalPlayers = tournament.total_player;
      const numberOfRounds = Math.log2(totalPlayers);
      // let matchIdCounter = 1;
      const matchesData = [];
      const match_time = new Date(tournament.tournament_start_date).toISOString();
      // Create matches for the first round
      for (let i = 0; i < players.length; i += 2) {
        matchesData.push({
          tournamentId: Number(tournamentId),
          match_time,
          round: 1,
          position: i / 2,
          player1Id: players[i],
          player2Id: players[i + 1] || null, // Handle odd number of players
          // id: matchIdCounter++,
        });
      }

      // Create placeholder matches for future rounds
      for (let round = 2; round <= numberOfRounds; round++) {
        const numberOfMatchesInRound = totalPlayers / Math.pow(2, round);
        for (let position = 0; position < numberOfMatchesInRound; position++) {
          matchesData.push({
            tournamentId: Number(tournamentId),
            round,
            position,
            // id: matchIdCounter++,
          });
        }
      }
      await prisma.match.createMany({data: matchesData});
      console.log('Matches initialized successfully.');
    } catch (error) {
      console.log(error, 'error');
    }
  }
  async declareWinnerAndTime(match_id: string, winnerId: string) {
    try {
      const match = await prisma.match.findUnique({
        where: {id: parseInt(match_id)},
        include: {tournament: true},
      });

      if (!match || !match.tournament) {
        throw HttpException.notFound('Match or tournament not found.');
      }

      const isTeamTournament = match.tournament.tournament_game_mode == 'duo';
      console.log(
        '🚀 ~ TournamentService ~ declareWinnerAndTime ~ isTeamTournament:',
        isTeamTournament,
      );

      // Validate winner against match participants
      if (isTeamTournament) {
        if (match.team1Id !== Number(winnerId) && match.team2Id !== Number(winnerId)) {
          throw HttpException.badRequest('Winner is not one of the teams in the match.');
        }
      } else {
        if (match.player1Id !== Number(winnerId) && match.player2Id !== Number(winnerId)) {
          throw HttpException.badRequest('Winner is not one of the players in the match.');
        }
      }

      // Update match with the correct winner field
      await prisma.match.update({
        where: {id: parseInt(match_id)},
        data: isTeamTournament ? {winnerTeamId: Number(winnerId)} : {winnerId: Number(winnerId)},
      });

      // Check if this was the final match
      const tournament = await prisma.tournament.findUnique({
        where: {id: match.tournamentId},
        include: {matches: true},
      });

      if (!tournament) {
        throw HttpException.notFound('Tournament not found');
      }

      const finalMatch = tournament.matches.find(
        (m) => m.round === Math.log2(tournament.total_player) && m.position === 0,
      );

      if (finalMatch && finalMatch.id === parseInt(match_id)) {
        if (isTeamTournament) {
          // For team tournaments, update team stats if needed
          await prisma.teams.update({
            where: {id: Number(winnerId)},
            data: {
              wins: {increment: 1},
              tournaments_played: {increment: 1},
            },
          });
        } else {
          // For solo tournaments, update user and tournament winner
          await prisma.$transaction([
            prisma.user.update({
              where: {id: Number(winnerId)},
              data: {
                wins: {increment: 1},
                tournaments_played: {increment: 1},
              },
            }),
            prisma.tournament.update({
              where: {id: tournament.id},
              data: {winnerId: Number(winnerId)},
            }),
          ]);
        }
      }

      // Check if all current round matches are completed
      const currentRoundMatches = await prisma.match.findMany({
        where: {
          tournamentId: match.tournamentId,
          round: match.round,
        },
      });

      const winners = currentRoundMatches
        .map((m) => (isTeamTournament ? m.winnerTeamId : m.winnerId))
        .filter((w) => w !== null);

      const allMatchesCompleted = currentRoundMatches.every((m) =>
        isTeamTournament ? m.winnerTeamId !== null : m.winnerId !== null,
      );

      if (allMatchesCompleted) {
        const nextRoundNumber = match.round + 1;
        const nextRoundMatches = await prisma.match.findMany({
          where: {
            tournamentId: match.tournamentId,
            round: nextRoundNumber,
          },
          orderBy: {position: 'asc'},
        });

        if (nextRoundMatches.length > 0) {
          // Update existing next round matches
          for (let i = 0; i < nextRoundMatches.length; i++) {
            const updateData = isTeamTournament
              ? {
                  team1Id: winners[i * 2] || null,
                  team2Id: winners[i * 2 + 1] || null,
                }
              : {
                  player1Id: winners[i * 2] || null,
                  player2Id: winners[i * 2 + 1] || null,
                };

            await prisma.match.update({
              where: {id: nextRoundMatches[i].id},
              data: updateData,
            });
          }
        } else if (winners.length === 2) {
          // Create final match
          await prisma.match.create({
            data: {
              tournamentId: match.tournamentId,
              round: nextRoundNumber,
              position: 0,
              ...(isTeamTournament
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
        }
      }
    } catch (error) {
      console.error('Error declaring winner:', error);
      throw error;
    }
  }

  async getUserTournamentWins(userid: string) {
    await prisma.tournament.findMany({
      where: {
        winnerId: Number(userid),
      },
    });
  }

  async getMyTournament(userId: string) {
    // Fetch tournaments where the user is a participant
    const tournaments = await prisma.tournament.findMany({
      where: {
        participants: {
          some: {
            userId: parseInt(userId), // Ensure userId is converted to a number if necessary
          },
        },
      },
      include: {
        games: true,
        participants: true, // Include participants if needed
      },
    });
    console.log('🚀 ~ TournamentService ~ mero tourni ~ tournaments:', tournaments);
    return tournaments;
  }

  async getUserMatches(userId: string) {
    try {
      const teamMemberships = await prisma.teamPlayers.findMany({
        where: { user_id: parseInt(userId) },
        select: { team_id: true },
      });
      const teamIds = teamMemberships.map((t) => t.team_id);
  
      const matches = await prisma.match.findMany({
        where: {
          OR: [
            { player1Id: Number(userId) },
            { player2Id: Number(userId) },
            { team1Id: { in: teamIds } },
            { team2Id: { in: teamIds } },
          ],
        },
        include: {
          player1: true,
          player2: true,
          team1: { include: { teamPlayers: true } },
          team2: { include: { teamPlayers: true } },
          tournament: { include: { games: true } },
          winner: true,
          winnerTeam: true,
          ScoreSubmission: true,
        },
        orderBy: [{ tournamentId: 'asc' }, { round: 'asc' }, { position: 'asc' }],
      });
  
      // Process each match to calculate scores
      const processedMatches = matches.map((match) => {
        let player1Score = 0;
        let player2Score = 0;
        let team1Score = 0;
        let team2Score = 0;
        const isPointsBased = match.tournament.is_points_based;
        const userHasSubmitted = match.ScoreSubmission.some(
          (sub) => sub.submittedBy === Number(userId)
        );
        match.ScoreSubmission.forEach((submission) => {
          if (submission.status !== 'APPROVED') return;
  
          if (isPointsBased) {
            // Calculate points from kills and placement
            const killPoints = submission.kills || 0;
            let placementPoints = 0;
            const placement = submission.placement || 0;
            if (placement === 1) placementPoints = 12;
            else if (placement === 2) placementPoints = 9;
            else if (placement === 3) placementPoints = 7;
            else if (placement <= 5) placementPoints = 5;
            else if (placement <= 10) placementPoints = 3;
            else if (placement <= 15) placementPoints = 2;
            else if (placement <= 20) placementPoints = 1;
            const totalPoints = killPoints + placementPoints;
  
            if (submission.isTeam) {
              // Check which team the submitter belongs to
              const inTeam1 = match.team1?.teamPlayers.some(tp => tp.user_id === submission.submittedBy);
              if (inTeam1) team1Score += totalPoints;
              else {
                const inTeam2 = match.team2?.teamPlayers.some(tp => tp.user_id === submission.submittedBy);
                if (inTeam2) team2Score += totalPoints;
              }
            } else {
              // Solo submission
              if (submission.submittedBy === match.player1Id) player1Score += totalPoints;
              else if (submission.submittedBy === match.player2Id) player2Score += totalPoints;
            }
          } else {
            // Elimination match, use playerScore
            const score = submission.playerScore || 0;
            if (submission.isTeam) {
              const inTeam1 = match.team1?.teamPlayers.some(tp => tp.user_id === submission.submittedBy);
              if (inTeam1) team1Score += score;
              else {
                const inTeam2 = match.team2?.teamPlayers.some(tp => tp.user_id === submission.submittedBy);
                if (inTeam2) team2Score += score;
              }
            } else {
              if (submission.submittedBy === match.player1Id) player1Score += score;
              else if (submission.submittedBy === match.player2Id) player2Score += score;
            }
          }
        });
  
        // Assign computed scores to the match object
        return {
          ...match,
          player1Score: match.team1Id ? undefined : player1Score,
          player2Score: match.team2Id ? undefined : player2Score,
          team1Score: match.team1Id ? team1Score : undefined,
          team2Score: match.team2Id ? team2Score : undefined,
          scoreSubmitted: userHasSubmitted,
        };
      });
      return processedMatches;
    } catch (error) {
      console.error('Error fetching user matches:', error);
      throw error;
    }
  }
}
export default new TournamentService();
