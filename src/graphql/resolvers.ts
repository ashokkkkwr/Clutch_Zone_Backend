import { authenticateUser } from '../middleware/authenticateUser';
import userService from '../services/user.service';
import gameService from '../services/game.service';
import tournamentService from '../services/tournament.service';
import { get } from 'http';
import teamService from '../services/team.service';
export const resolvers = {
  Query: {
    hello: () => "Hello World.",
    getGames:()=>{
      return gameService.getGames()
    },
    getTournaments:()=>{
      return tournamentService.getTournaments()
    },
    getTeams:()=>{
      return teamService.getTeam()
    },
    getTournament:async(_:any,{id}:{id:String})=>{
      return tournamentService.getTournament(id as string)
  },
  }, 
  Mutation: {
    register: async (
      _: any,
      { username, email, password }: { username: string; email: string; password: string },
      { req }: { req: any } // Access req from context
    ) => {
      return userService.register(username, email, password);
    },
    verifyOtp: async (_:any, { otp, email }:{otp:string;email:string}) => {
      return userService.verifyOtp(otp, email);
    },
    login:async(
      _:any,
      {email,password}:{email:string,password:string},
    )=>{
      return userService.login(email,password)
    },
    getDetails:async(
      _:any,
      context:any
    )=>{
      const id=authenticateUser(context)
      return userService.userDetails(id)
    },
    registerTournament:async(

      _:any,
      {id}:{id:string},

      context:any,


    )=>{
      console.log("🚀 ~ registerTournamentId:", id)
      const userId=authenticateUser(context)
      console.log("🚀 ~ userId:", userId)
      // const rgi
      return tournamentService.registerTournament(userId,id)
    },
    deleteGame:async(_:any,{id}:{id:String})=>{
      return gameService.deleteGame(id as string)
    },
    
  deleteTournament:async(_:any,{id}:{id:String})=>{

    return tournamentService.deleteTournament(id as string)
    
  }
},
}
