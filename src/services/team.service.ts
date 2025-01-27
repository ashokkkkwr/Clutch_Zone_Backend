import HttpException from "../utils/HttpException.utils";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()

class TeamService{
    async createTeam(team_name:string, max_players:string,slug:string,team_icon:string,user_id:string){
       
      const saved=  await prisma.teams.create({
            data:{
                team_name,
                max_players: parseInt(max_players),
                slug,
                logo: team_icon,
                team_leader: parseInt(user_id),
            }
        })
      console.log("🚀 ~ TeamService ~ createTeam ~ saved:", saved)
    }
    async getTeam(){
        const getAllTeams= await prisma.teams.findMany();
        return getAllTeams;
    }
}
export default new TeamService();

