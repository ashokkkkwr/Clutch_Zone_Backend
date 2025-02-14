import {authenticateUser} from '../middleware/authenticateUser';
import userService from '../services/user.service';
import gameService from '../services/game.service';
import tournamentService from '../services/tournament.service';
import {get} from 'http';
import teamService from '../services/team.service';
export const resolvers = {
  Query: {
    hello: () => 'Hello World.',
    getGames: () => {
      return gameService.getGames();
    },
    getTournaments: () => {
      return tournamentService.getTournaments();
    },

    getTournament: async (_: any, {id}: {id: String}) => {
      return tournamentService.getTournament(id as string);
    },
    getTeams: () => {
      return teamService.getTeam();
    },
    getOwnTeamDetails: (_: any, args: any, context: any) => {
      const userId = authenticateUser(context);
      return teamService.getOwnTeamDetails(userId);
    },
    getPendingRequests: async (_: any, args: any, context: any) => {
      const userId = authenticateUser(context);
      console.log('🚀 ~ userId:', userId);
      return await teamService.getPendingRequests(userId);
    },
  },
  Mutation: {
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
  },
};
