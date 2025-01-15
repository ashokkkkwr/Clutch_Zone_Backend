
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
        games_id: string
    ) {
    
        try {
            // Create tournament record in the database
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
                },
            });
             // Create an empty bracket
        await prisma.bracket.create({
            data: {
                tournamentId: tournament.id,
                data: JSON.stringify({
                    rounds: [],
                    leaderboard: [],
                }),
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
async getBracket(id:string){
    try{
        const bracket=await prisma.bracket.findUnique({
            where:{
                tournamentId:parseInt(id)
            },
            select:{data:true}
        })
        if(!bracket){
            throw HttpException.internalServerError('Something went wrong');
        }
        return bracket;
    }catch(err) {
    console.log("🚀 ~ TournamentService ~ getBracket ~ err:", err)
    }
}


}



export default new TournamentService(); 