import {PrismaClient} from '@prisma/client';    
const primsa=new PrismaClient();
import tournament from '../services/tournament.service'; 
import {Request,Response} from 'express';
class TournamentController{
    async createTournament(req:Request,res:Response){
        console.log("object");
        const{tournament_name,tournament_description,tournament_entry_fee,tournament_start_date,tournament_end_date,tournament_registration_start_date,tournament_registration_end_date,tournament_game_mode,tournament_streaming_link,games_id}=req.body;
        const files =req.files as {[fieldname:string]:Express.Multer.File[]}|undefined;
        const tournament_icon=files?.['tournament_icon']
        ?files['tournament_icon'][0].path
        :'';
        console.log("🚀 ~ TournamentController ~ createTournament ~ tournament_icon:", tournament_icon)

        const tournament_cover=files?.['tournament_cover']
        ?files['tournament_cover'][0].path
        :'';
        console.log("🚀 ~ TournamentController ~ createTournament ~ tournament_cover:", tournament_cover)

        const saved=await tournament.createTournament(tournament_icon,tournament_cover,tournament_name,tournament_description,tournament_entry_fee,tournament_start_date,tournament_end_date,tournament_registration_start_date,tournament_registration_end_date,tournament_game_mode,tournament_streaming_link,games_id)
        return res.status(201).json({message:'Tournament created successfully',data:saved});
    }
    async updateTournament(req:Request,res:Response){
        const {tournament_name,tournament_description,tournament_entry_fee,tournament_start_date,tournament_end_date,tournament_registration_start_date,tournament_registration_end_date,tournament_game_mode,tournament_streaming_link,games_id}=req.body;
        const files=req.files as {[fieldname:string]:Express.Multer.File[]}|undefined;
        const tournament_icon=files?.['tournament_icon']
        ?files['tournament_icon'][0].path
        :'';
        const tournament_cover=files?.['tournament_cover']
        ?files['tournament_cover'][0].path
        :'';
        const updatedTournament=await primsa.tournament.update({
            where:{
                id:parseInt(req.params.id)
            },
            data:{
                tournament_name,
                tournament_description,
                tournament_entry_fee:parseInt(tournament_entry_fee),
                tournament_start_date,
                tournament_end_date,
                tournament_registration_start_date,
                tournament_registration_end_date,
                tournament_game_mode,
                tournament_streaming_link,
                games_id:parseInt(games_id),
                tournament_icon,
                tournament_cover
            }
        })
        res.status(200).json(updatedTournament)
    }
    
}
export default new TournamentController();