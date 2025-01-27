import {PrismaClient} from '@prisma/client';    
const primsa=new PrismaClient();
import tournament from '../services/tournament.service'; 
import team from '../services/team.service';
import {Request,Response} from 'express';
class TeamController{
    async createTeam(req:Request, res:Response){
        const userId = req.user?.id
        console.log("🚀 ~ TeamController ~ createTeam ~ userId:", userId)
        

    const files =req.files as {[fieldname:string]:Express.Multer.File[]}|undefined;
    const team_icon=files?.['image']
    ?files['image'][0].path:'';
    const {team_name,max_players,slug} = req.body
    const create = await team.createTeam(team_name,max_players,slug,team_icon,userId as string);

    }
//     id                  Int                @id @default(autoincrement())
//   team_name           String             @unique @map("team_name")
//   logo                String?
//   max_players         Int                @map("max_players")
//   slug                String?
//   wins                Int                @default(0)
//   tournaments_played  Int                @default(0) @map("tournaments_played")
//   user_id             Int
//   user                user               @relation(fields: [user_id], references: [id])
//   team_players        team_players[]
//   tournament_registrations tournament_registration[]





    // async createTournament(req:Request,res:Response){
    //     console.log("object");
    //     const{tournament_name,tournament_description,tournament_entry_fee,tournament_start_date,tournament_end_date,tournament_registration_start_date,tournament_registration_end_date,tournament_game_mode,tournament_streaming_link,games_id,total_player}=req.body;
    //     const files =req.files as {[fieldname:string]:Express.Multer.File[]}|undefined;
    //     const tournament_icon=files?.['tournament_icon']
    //     ?files['tournament_icon'][0].path
    //     :'';
    //     console.log("🚀 ~ TournamentController ~ createTournament ~ tournament_icon:", tournament_icon)

    //     const tournament_cover=files?.['tournament_cover']
    //     ?files['tournament_cover'][0].path
    //     :'';
    //     console.log("🚀 ~ TournamentController ~ createTournament ~ tournament_cover:", tournament_cover)
    //     console.log("🚀 ~ TournamentController ~ createTournament ~ total_player:", total_player)

    //     const saved=await tournament.createTournament(tournament_icon,tournament_cover,tournament_name,tournament_description,tournament_entry_fee,tournament_start_date,tournament_end_date,tournament_registration_start_date,tournament_registration_end_date,tournament_game_mode,tournament_streaming_link,games_id,total_player,)
    //     return res.status(201).json({message:'Tournament created successfully',data:saved});
    // }
    // async updateTournament(req:Request,res:Response){
    //     const {tournament_name,tournament_description,tournament_entry_fee,tournament_start_date,tournament_end_date,tournament_registration_start_date,tournament_registration_end_date,tournament_game_mode,tournament_streaming_link,games_id}=req.body;
    //     const files=req.files as {[fieldname:string]:Express.Multer.File[]}|undefined;
    //     const tournament_icon=files?.['tournament_icon']
    //     ?files['tournament_icon'][0].path
    //     :'';
    //     const tournament_cover=files?.['tournament_cover']
    //     ?files['tournament_cover'][0].path
    //     :'';
    //     const updatedTournament=await primsa.tournament.update({
    //         where:{
    //             id:parseInt(req.params.id)
    //         },
    //         data:{
    //             tournament_name,
    //             tournament_description,
    //             tournament_entry_fee:parseInt(tournament_entry_fee),
    //             tournament_start_date,
    //             tournament_end_date,
    //             tournament_registration_start_date,
    //             tournament_registration_end_date,
    //             tournament_game_mode,
    //             tournament_streaming_link,
    //             games_id:parseInt(games_id),
    //             tournament_icon,
    //             tournament_cover
    //         }
    //     })
    //     res.status(200).json(updatedTournament)
    // }
    // async fetchBrackets(req: Request, res: Response){
    //     const {id} = req.params;
    //     console.log("🚀 ~ TournamentController ~ fetchBrackets ~ id:", id)
    //     const bracket = await tournament.getBracket(id);
    //     return res.status(200).json(bracket);
    // } 
}
export default new TeamController();