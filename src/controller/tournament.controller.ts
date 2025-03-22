import {PrismaClient} from '@prisma/client';    
const primsa=new PrismaClient();
import tournament from '../services/tournament.service'; 
import {Request,Response} from 'express';
class TournamentController{
    async createTournament(req:Request,res:Response){
        console.log(req.body)
        const{tournament_name,tournament_description,tournament_entry_fee,tournament_start_date,tournament_end_date,tournament_registration_start_date,tournament_registration_end_date,tournament_game_mode,tournament_streaming_link,games_id,total_player,prizePools, is_points_based,total_rounds}=req.body;
        const files =req.files as {[fieldname:string]:Express.Multer.File[]}|undefined;
        const baseUrl = `${req.protocol}://${req.get('host')}`
        const prizePoolsArray = JSON.parse(prizePools);


        // Construct the full URLs for gameCoverImage and gameIcon
        const tournament_cover = files?.['tournament_cover']
            ? `${baseUrl}/${files['tournament_cover'][0].path.replace(/\\/g, '/')}` // Replace backslashes for Windows
            : null;
        const tournament_icon = files?.['tournament_icon']
            ? `${baseUrl}/${files['tournament_icon'][0].path.replace(/\\/g, '/')}`
            : null;


          console.log(typeof(prizePools))  
         

        console.log("🚀 ~ TournamentController ~ createTournament ~ tournament_cover:", tournament_cover)
        console.log("🚀 ~ TournamentController ~ createTournament ~ total_player:", total_player)
        

        const saved=await tournament.createTournament(tournament_icon!,tournament_cover!,tournament_name,tournament_description,tournament_entry_fee,tournament_start_date,tournament_end_date,tournament_registration_start_date,tournament_registration_end_date,tournament_game_mode,tournament_streaming_link,games_id,total_player,prizePoolsArray, is_points_based,total_rounds)
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
    async fetchBrackets(req: Request, res: Response){
        const {id} = req.params;
        console.log("🚀 ~ TournamentController ~ fetchBrackets ~ id:", id)
        const bracket = await tournament.getTournamentBracket(Number(id));
        console.log("🚀 ~ TournamentController ~ fetchBrackets ~ bracket:", bracket)
        return res.status(200).json(bracket);
    } 
    async registerTournament(req:Request,res:Response){
        const {id} = req.params;
        const userId = req?.user?.id;

        const register = await tournament.registerTournament(userId!,id)
        console.log("🚀 ~ TournamentController ~ registerTournament ~ register:", register)
    }
    async getUserMatches(req:Request,res:Response){
        const userId = req.user?.id;
        const matches = await tournament.getUserMatches(userId!);
        return res.status(200).json(matches);
    }
}
export default new TournamentController();