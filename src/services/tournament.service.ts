
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
            const createDraftBracket = await prisma.bracket.create({
                data: {
                    tournamentId: tournament.id,
                    totalPlayers: parseInt(total_player), // Ensure total players match tournament settings
                    user_id: null, // Assuming a draft bracket doesn't yet assign users
                },
            });
            
        
    
            return tournament;
        } catch (error) {
            console.log("🚀 ~ TournamentService ~ error:", error);
            throw HttpException.internalServerError('Something went wrong');
        }
    }
      
async getTournaments(){
    const tournaments=await prisma.tournament.findMany({
        include:{
            games:true
        }
    })
    console.log("🚀 ~ TournamentService ~ getTournaments ~ tournaments:", tournaments)
    return tournaments;
}
async getTournament(id:string){
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
async deleteTournament( id:string){
    const tournament=await prisma.tournament.delete({
        where:{
            id:parseInt(id)
        }
    })
    return tournament;
}
async getBracket(id: string) {
    try {
        const bracket = await prisma.bracket.findUnique({
            where: { tournamentId: parseInt(id) },
            include: { tournament: true, user: true },
        });
        if (!bracket) {
            throw HttpException.notFound('Bracket not found');
        }
        return bracket;
    } catch (err) {
        console.error('Error retrieving bracket:', err);
        throw HttpException.internalServerError('Something went wrong');
    }
}
async registerTournament(user_id:string,tournament_id:string){
console.log("🚀 ~ TournamentService ~ registerTournament ~ tournament_id:", tournament_id)
console.log("🚀 ~ TournamentService ~ registerTournament ~ user_id:", user_id)
console.log('haha')
const tournmanet = await prisma.tournament.findFirst({
    where:{
         id:Number(tournament_id)
    }
})
const user= await prisma.user.findFirst({
    where:{
        id:Number(user_id)
    }
})
console.log("🚀 ~ TournamentService ~ registerTournament ~ user:", user)
console.log("🚀 ~ TournamentService ~ registerTournament ~ tournmanet:", tournmanet)

}
}
export default new TournamentService(); 