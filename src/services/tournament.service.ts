
import HttpException from '../utils/HttpException.utils';
import {BracketsManager}  from 'brackets-manager'
import { PrismaClient } from '@prisma/client';
const prisma=new PrismaClient();
const storage = new(require('brackets-json-db').JsonDatabase)();
const manager= new BracketsManager(storage);
class TournamentService{
    async createTournament(
        tournament_icon: string,
        tournament_cover: string,
        tournament_name: string,
        tournament_description: string,
        tournament_entry_fee: string,
        tournament_start_date: string,
        tournament_end_date: string,
        tournament_registration_start_date: string,
        tournament_registration_end_date: string,
        tournament_game_mode: string,
        tournament_streaming_link: string,
        games_id: string,
        //minimum numbher of players like 16 8 4 or 2 players
        total_player:string
    ) {
        console.log("🚀 ~ TournamentService ~ total_player:", total_player)
        const validPlayers = [2, 4, 8, 16, 32];
        if (!validPlayers.includes(parseInt(total_player))) {
            throw HttpException.badRequest(
                `Invalid total players. Must be one of ${validPlayers.join(', ')}`
            );
        }
        try {
            const tournament = await prisma.tournament.create({
                data: {
                    tournament_name,
                    tournament_icon,
                    tournament_cover,
                    tournament_description,
                    tournament_entry_fee: parseInt(tournament_entry_fee),
                    tournament_registration_start_date,
                    tournament_registration_end_date,
                    tournament_start_date,
                    tournament_end_date,
                    tournament_game_mode,
                    tournament_streaming_link,
                    games_id: parseInt(games_id),
                    total_player: parseInt(total_player)
                },
            });
           
            
        
    
            return tournament;
        } catch (error) {
            console.log("🚀 ~ TournamentService ~ error:", error);
            throw HttpException.internalServerError('Something went wrong');
        }
    }
      
async getTournaments(){
    console.log('ya ta xa ta')

    const tournaments=await prisma.tournament.findMany({
        include:{
            games:true
        }
    })
    console.log("🚀 ~ TournamentService ~ getTournaments ~ tournaments:", tournaments)
    return tournaments;
}
async getTournament(id:string){
    console.log('ya ta xa ta')
    const tournament=await prisma.tournament.findUnique({
        where:{
            id:parseInt(id)
        },
        include:{
            games:true
        }
    })
    console.log("🚀 ~ TournamentService ~ getTournament ~ tournament:", tournament)
    return tournament;
}
async deleteTournament(id: string) {
    console.log("🚀 ~ TournamentService ~ deleteTournament ~ id:", id);
    const tournamentId = parseInt(id);
  
    // Delete matches related to the tournament
    await prisma.match.deleteMany({
      where: { tournamentId: tournamentId },
    });
  
    await prisma.participant.deleteMany({
      where: { tournamentId: tournamentId },
    });
  
    await prisma.prize_pool.deleteMany({
      where: { tournament_id: tournamentId },
    });
  
  
    await prisma.tournament_history.deleteMany({
      where: { tournamentId: tournamentId },
    });
  
    await prisma.bracket.deleteMany({
      where: { tournamentId: tournamentId },
    });
  

  
    const tournament = await prisma.tournament.delete({
      where: { id: tournamentId },
    });
  
    return tournament;
  }
  
  
async getTournamentBracket(tournamentId: number) {
    console.log("🚀 ~ TournamentService ~ getTournamentBracket ~ tournamentId:", tournamentId)
    const bracket = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: {
            matches: {
                include: {
                    player1: true,
                    player2: true,
                    winner: true,
                    team1: true,
                    team2: true,
                    winnerTeam: true
                },
                orderBy: [{ round: 'asc' }, { position: 'asc' }]
            },
            participants: {
                include: { user: true, team:true },
                orderBy: { seed: 'asc' }
            }
        }
    });

    if (!bracket) {
        throw HttpException.notFound('Tournament not found.');
    }

    // Check if any player is missing in the slots
    const hasEmptySlots = bracket.matches.some(match => !match.player1Id || !match.player2Id);

    if (hasEmptySlots) {
        // Return draft bracket logic here
        return {
            ...bracket,
            isDraft: true,
            message: 'Some slots are empty. Displaying draft bracket.'
        };
    }

    return bracket;
}
  
async registerTournament(user_id:string,tournament_id:string){

   
        const tournament = await prisma.tournament.findUnique({
            where:{
                id:Number(tournament_id)
            },
            include:{participants:true}
        })
        console.log("🚀 ~ TournamentService ~ returnprisma.$transaction ~ tournament:", tournament)
        if(!tournament) throw HttpException.notFound('Tournament not found.');



        const gameMode = tournament.tournament_game_mode.toLocaleLowerCase();
        const isSolo= gameMode ==='solo';
        const isTeam = ['duo','squad'].includes(gameMode);
        if(isTeam){
            return this.handleTeamRegistration(user_id,tournament);
        }
    
        //handle solo registration
        if(isSolo){
            if(tournament.participants.length >= tournament.total_player){
                throw HttpException.badRequest('Tournament is full')
            }
            const ifExists= await prisma.participant.findFirst({
                where:{
                    userId:Number(user_id),
                    tournamentId:Number(tournament_id),
    
                }
            })
            console.log("🚀 ~ TournamentService ~ returnprisma.$transaction ~ ifExists:", ifExists)
            if(ifExists){
                throw HttpException.internalServerError('Already registered')
            }
            const participant = await prisma.participant.create({
                data:{
                    userId:Number(user_id),
                    tournamentId:Number(tournament_id),
                    seed:tournament.participants.length +1
    
                }
            })
            console.log("🚀 ~ TournamentService ~ returnprisma.$transaction ~ participant:", participant)
    
          
            if(tournament.participants.length + 1 ===tournament.total_player){
                await this.initializeMatches(tournament_id)
            }
            return
        }
}
private async handleTeamRegistration(user_id: string, tournament:any) {
    const gameMode = tournament.tournament_game_mode.toLowerCase();

    const validGameModes = ['duo', 'squad'] as const;
    console.log("🚀 ~ TournamentService ~ handleTeamRegistration ~ validGameModes:", validGameModes)
    
    if (!validGameModes.includes(gameMode as any)) {
        throw new Error('Invalid game mode');
    }

    const requiredPlayers = gameMode === 'duo' ? 2 : 4;
    console.log("🚀 ~ TournamentService ~ handleTeamRegistration ~ requiredPlayers:", requiredPlayers)



    //verify team ownership 
    // Verify team leadership and get team ID
    const teamLeader = await prisma.team_players.findFirst({
        where: {
            user_id: Number(user_id),
            role: 'TEAM_LEADER'
        }
    });
    console.log("🚀 ~ TournamentService ~ handleTeamRegistration ~ teamLeader:", teamLeader)


    if (!teamLeader) {
        throw HttpException.badRequest('You are not a team leader.');
    }
    const teamId = teamLeader.team_id;
    console.log("🚀 ~ TournamentService ~ handleTeamRegistration ~ teamId:", teamId)

    // Check team member count
    const teamMembersCount = await prisma.team_players.count({
        where: { team_id: teamId }
    });
    console.log("🚀 ~ TournamentService ~ handleTeamRegistration ~ teamMembersCount:", teamMembersCount)
    if (teamMembersCount !== requiredPlayers) {
        console.log("🚀 ~ TournamentService ~ handleTeamRegistration ~ requiredPlayers:", requiredPlayers)
        console.log("🚀 ~ TournamentService ~ handleTeamRegistration ~ teamMembersCount:", teamMembersCount)
        console.log('yoyo')
        throw HttpException.badRequest(`Team requires exactly ${requiredPlayers} members`);
    }

    // Check existing team registration
    const existingRegistration = await prisma.participant.findFirst({
        where: {
            tournamentId: tournament.id,
            teamId: teamId
        }
    });
    console.log("🚀 ~ TournamentService ~ handleTeamRegistration ~ existingRegistration:", existingRegistration)

    if (existingRegistration) {
        throw HttpException.badRequest('Team already registered');
    }

    // Check tournament capacity
    const teamParticipants = await prisma.participant.count({
        where: { tournamentId: tournament.id }
    });
    console.log("🚀 ~ TournamentService ~ handleTeamRegistration ~ teamParticipants:", teamParticipants)

    if (teamParticipants >= tournament.total_player) {
        console.log("🚀 ~ TournamentService ~ handleTeamRegistration ~ teamParticipants:", teamParticipants)
        throw HttpException.badRequest('Tournament is full');
    }
    // Register the team
    await prisma.participant.create({
        data: {
            teamId: teamId,
            tournamentId: tournament.id,
            seed: teamParticipants + 1
        }
    });
    if (teamParticipants + 1 === tournament.total_player) {
        await this.initializeTeamMatches(tournament.id.toString());
    }
  


}
private async initializeTeamMatches(tournamentId: string) {

    const tournament = await prisma.tournament.findUnique({
        where: { id: Number(tournamentId) },
        include: { participants: { include: { team: true } } }
    });
    if(!tournament){
        throw HttpException.badRequest('Tournament not found');

    }

    const teamIds = tournament.participants.map(p => p.teamId).filter(Boolean) as number[];    
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
            team2Id: teamIds[i + 1] || null
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
                position: pos
            });
        }
    }

    await prisma.match.createMany({ data: matchesData });
}

private async initializeMatches(tournamentId: string) {
    try{
        console.log('Initializing matches...');
    
        const tournament = await prisma.tournament.findUnique({
            where: { id: Number(tournamentId) },
            include: { participants: true },
        });
    
        if (!tournament) {
            throw HttpException.notFound('Tournament not found.');
        }
    
        let players = tournament.participants.map(p => p.userId);
        
        // Fisher-Yates Shuffle Algorithm for Randomizing Players
        for (let i = players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [players[i], players[j]] = [players[j], players[i]];
        }
    
        console.log("🚀 ~ TournamentService ~ initializeMatches ~ shuffledPlayers:", players);
    
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
        await prisma.match.createMany({ data: matchesData });
        console.log('Matches initialized successfully.');
    }catch(error){
        console.log(error,'error')
    }
  
}
async declareWinnerAndTime(match_id: string, winnerId: string) {
    console.log("🚀 ~ TournamentService ~ declareWinnerAndTime ~ winnerId:", winnerId)
    console.log("🚀 ~ TournamentService ~ declareWinnerAndTime ~ match_id:", match_id)
    
    try {
        const match = await prisma.match.findUnique({
            where: { id: parseInt(match_id) },
            include:{tournament:true},
        });

        if (!match) {
            throw HttpException.notFound('Match not found.');
        }

        // Check if the winnerId is one of the players in the match
        if (match.player1Id !== Number(winnerId) && match.player2Id !== Number(winnerId)) {
            throw HttpException.badRequest('Winner is not one of the players in the match.');
        }

        // Update the match to declare the winner
        await prisma.match.update({
            where: { id: parseInt(match_id) },
            data: { winnerId: Number(winnerId) },
        });

        //check if this was the final match
        const tournament= await prisma.tournament.findUnique({
            where:{
                id:match.tournamentId
            },
            include:{matches:true},
        })
        if(!tournament){
            throw HttpException.notFound("Tournament not found")
        }
        const finalMatch=tournament.matches.find(m=>m.round===Math.log2(tournament.total_player)&& m.position===0);
        if(finalMatch&& finalMatch.id===match.id && finalMatch.winnerId !==null){
            //Declare the winner of the tournament
            await prisma.tournament.update({
                where:{id:match.tournamentId},
                data:{winnerId:Number(winnerId)},
            })
        }
        // Check if this was the last match of the current round
        const currentRoundMatches = await prisma.match.findMany({
            where: {
                tournamentId: match.tournamentId,
                round: match.round,
            },
        });

        const allMatchesCompleted = currentRoundMatches.every(m => m.winnerId !== null);

        if (allMatchesCompleted) {
            // Proceed to next round if it's not already the finals
            const nextRoundNumber = match.round + 1;
            const nextRoundMatches = await prisma.match.findMany({
                where: {
                    tournamentId: match.tournamentId,
                    round: nextRoundNumber,
                },
                orderBy: { position: 'asc' },
            });

            let winners = currentRoundMatches.map(m => m.winnerId).filter(w => w !== null);

            if (nextRoundMatches.length > 0) {
                // Assign winners to next round matches
                for (let i = 0; i < nextRoundMatches.length; i++) {
                    await prisma.match.update({
                        where: { id: nextRoundMatches[i].id },
                        data: {
                            player1Id: winners[i * 2] || null,
                            player2Id: winners[i * 2 + 1] || null,
                        },
                    });
                }
            } else if (winners.length === 2) {
                // This is the finals
                await prisma.match.create({
                    data: {
                        tournamentId: match.tournamentId,
                        round: nextRoundNumber,
                        position: 0,
                        player1Id: winners[0],
                        player2Id: winners[1],
                    },
                });
            }
        }
    } catch (error) {
        console.log(error, 'error');
    }
}


//   async advanceToNextRound(tournamentId: number) {
//     const currentRoundMatches = await prisma.match.findMany({
//       where: {
//         tournamentId,
//         winnerId: { not: null },  // Ensure matches are completed
//       },
//       orderBy: [{ round: 'asc' }, { position: 'asc' }],
//     });
  
//     if (currentRoundMatches.length === 0) {
//       throw  HttpException.notFound('No matches available for the current round.');
//     }
  
//     const currentRound = currentRoundMatches[0].round;
//     const nextRound = currentRound + 1;
  
//     const winners = currentRoundMatches.map(match => match.winnerId);
  
//     if (winners.length < 2) {
//       return { message: 'Tournament has concluded.' };
//     }
  
//     const numberOfNextRoundMatches = winners.length / 2;
//     const newMatchesData = [];
  
//     for (let i = 0; i < numberOfNextRoundMatches; i++) {
//       newMatchesData.push({
//         tournamentId,
//         round: nextRound,
//         position: i,
//         player1Id: winners[i * 2],
//         player2Id: winners[i * 2 + 1],
//       });
//     }
  
//     await prisma.match.createMany({ data: newMatchesData });
//     console.log('vayo sab')
  
//     return { message: `Round ${nextRound} matches created successfully.` };
//   }
async   getUserTournamentWins(userid:string){
    await prisma.tournament.findMany({
        where:{
            winnerId:Number(userid)
        }
    })
  }

}
export default new TournamentService(); 