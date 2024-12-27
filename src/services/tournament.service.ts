
import HttpException from '../utils/HttpException.utils';
import { PrismaClient } from '@prisma/client';
const prisma=new PrismaClient();


class TournamentService{
async createTournament(tournament_icon:string,tournament_cover:string,tournament_name:string,tournament_description:string,tournament_entry_fee:string,tournament_start_date:string,tournament_end_date:string,tournament_registration_start_date:string,tournament_registration_end_date:string,tournament_game_mode:string,tournament_streaming_link:string,games_id:string){
console.log('object');
    try{
        const tournament=await prisma.tournament.create({
            data:{
                tournament_name,
                tournament_icon,
                tournament_cover,
                tournament_description,
                tournament_entry_fee:parseInt(tournament_entry_fee),
                tournament_registration_start_date,
                tournament_registration_end_date,
                tournament_start_date,
                tournament_end_date,
                tournament_game_mode,
                tournament_streaming_link,
                games_id:parseInt(games_id),
            }
        })
       return tournament;
    }catch(error){
        console.log("🚀 ~ TournamentService ~ error:", error)
        
        throw  HttpException.internalServerError('Something went wrong'); 
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
}
export default new TournamentService(); 