import {authenticateUser} from '../middleware/authenticateUser';
import userService from '../services/user.service';
import gameService from '../services/game.service';
import tournamentService from '../services/tournament.service';
import {get} from 'http';
import teamService from '../services/team.service';
import {v4 as uuidv4} from 'uuid';
import crypto from 'crypto';
import axios from 'axios';
import paymentService from '../services/payment.service';
import gearService from '../services/gear.service';
export const resolvers = {
  Query: {
    hello: () => 'Hello World.',
    getGames: () => {
      return gameService.getGames();
    },
    getTournaments: () => {
      return tournamentService.getTournaments();
    },
    getUpcomingTournaments:()=>{
      return tournamentService.getUpcommingTournaments()
    },
    getOngoingTournaments:()=>{
      return tournamentService.getOngoingTournaments()
    },
    getPastTournaments:()=>{
      return tournamentService.getPastTournaments()
    },

    getTournament: async (_: any, {id}: {id: String}) => {
      return tournamentService.getTournament(id as string);
    },
    getTeams: () => {
      return teamService.getTeam();
  },
    getGears:()=>{
return gearService.getGear();
    },
    getOwnTeamDetails: (_: any, args: any, context: any) => {
      const userId = authenticateUser(context);
      return teamService.getOwnTeamDetails(userId);
    },
    getClutchBucks:async(_:any, args:any,context:any)=>{
      const clutchLists=await  paymentService.getClutchBucks();
      console.log("🚀 ~ clutchLists:", clutchLists)
      return clutchLists
    },
    getPendingRequests: async (_: any, args: any, context: any) => {
      const userId = authenticateUser(context);
      console.log('🚀 ~ userId:', userId);
      return await teamService.getPendingRequests(userId);
    },
  },
  Mutation: {
    initiateEsewaPayment: async(_:any,{tournamentId}:{tournamentId:string},context:any)=>{
      const userId = authenticateUser(context);
      const esewaPayment = await paymentService.esewaPayment(userId,tournamentId);
      console.log("🚀 ~ initiateEsewaPayment:async ~ esewaPayment:", esewaPayment)
      return esewaPayment

    },
    verifyEsewaPayment:async(_:any,{input}:{input:string},context:any)=>{
      const userId= authenticateUser(context)
      const verify = await paymentService.verifivcationResponse(userId,input)
    },
    register: async (
      _: any,
      {username, email, password}: {username: string; email: string; password: string},
      {req}: {req: any}, // Access req from context
    ) => {
      return userService.register(username, email, password);
    },
    declareWinnerAndTime: async (
      _: any,
      {id, winner_id}: {id: string; winner_id: string},
      {req}: {req: any},
    ) => {
      console.log('🚀 ~ id:', id);
      const success = await tournamentService.declareWinnerAndTime(id, winner_id);

      return true;
    },

    verifyOtp: async (_: any, {otp, email}: {otp: string; email: string}) => {
      return userService.verifyOtp(otp, email);
    },
    login: async (_: any, {email, password}: {email: string; password: string}) => {
      return userService.login(email, password);
    },
    getDetails: async (_: any, context: any) => {
      const id = authenticateUser(context);
      return userService.userDetails(id);
    },
    registerTournament: async (_: any, {id}: {id: string}, context: any) => {
      console.log('🚀 ~ registerTournamentId:', id);
      const userId = authenticateUser(context);
      console.log('🚀 ~ userId:', userId);
      return tournamentService.registerTournament(userId, id);
    },
    updateAmount: async (_: any, {id}: {id: string}, context: any) => {
      console.log('🚀 ~ registerTournamentId:', id);
      const userId = authenticateUser(context);
      console.log('🚀 ~ userId:', userId);
      return paymentService.updateAmount(id, userId);
    },
   
    sendJoinRequest: async (_: any, {teamId}: {teamId: string}, context: any) => {
      const userId = authenticateUser(context);
      return teamService.sendJoinRequest(userId, teamId);
    },
    acceptRequest: async (_: any, {requestId}: {requestId: string}, context: any) => {
      const leaderId = authenticateUser(context);
      return teamService.acceptRequest(leaderId, requestId);
    },
    rejectRequest: async (_: any, {requestId}: {requestId: string}, context: any) => {
      const leaderId = authenticateUser(context);
      return teamService.rejectRequest(leaderId, requestId);
    },
    deleteGame: async (_: any, {id}: {id: String}) => {
      return gameService.deleteGame(id as string);
    },
    deleteTournament: async (_: any, {id}: {id: String}) => {
      console.log('🚀 ~ deleteTournament:async ~ id:', id);
      return tournamentService.deleteTournament(id as string);
    },
    // createBucks:async(_:any,{amount,cBucks,description}:{amount:string,cBucks:string,description:string},context:any)=>{
    //   console.log("🚀 ~ createBucks:async ~ description:", description)
    //   console.log("🚀 ~ createBucks:async ~ cBucks:", cBucks)
    //   console.log("🚀 ~ createBucks:async ~ amount:", amount)
    //   const userId= authenticateUser(context);
    //   return paymentService.createBucks(amount,cBucks,description,userId,)
    // }
  },
};
