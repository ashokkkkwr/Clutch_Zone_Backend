import { authenticateUser } from '../middleware/authenticateUser';
import userService from '../services/user.service';
import gameService from '../services/game.service';
import tournamentService from '../services/tournament.service';
import { get } from 'http';

export const resolvers = {
  Query: {
    hello: () => "Hello World.",
    getGames:()=>{
      return gameService.getGames()
    },
    getTournaments:()=>{
      return tournamentService.getTournaments()
    }
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
    deleteGame:async(_:any,{id}:{id:String})=>{
      return gameService.deleteGame(id as string)
    },
    getTournament:async(_:any,{id}:{id:String})=>{
      return tournamentService.getTournament(id as string)
  },
  deleteTournament:async(_:any,{id}:{id:String})=>{
    return tournamentService.deleteTournament(id as string)
  }
},
}
