import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    role: String!
    email: String
    token: String
  }
  type Game{
  id:String
  game_name:String
  game_cover_image:String
  game_icon_image:String
  }
  
  type TournamentDetails{
    id:String
    tournament_name:String
    tournament_icon:String
    tournament_cover:String
    tournament_description:String
    tournament_entry_fee:String
    tournament_start_date:String
    tournament_end_date:String
    tournament_registration_start_date:String
    tournament_registration_end_date:String
    tournament_game_mode:String
    tournament_streaming_link:String
    games:Game
    }
    type teams{
    id:String
    team_name:String
    slug:String
    logo:String
    team_leader:String
    }

  type Query {
    hello: String
    getGames:[Game]
    getTournaments:[TournamentDetails]
    getTeams:[teams]
    getTournament(id:ID!):TournamentDetails
  }
  type Mutation {
    register(username: String!, email: String!, password: String!): User
    verifyOtp(otp: String!, email: String!): Boolean
    login(email:String!, password:String!):User
    getDetails:[User]
    deleteGame(id:ID!):Game
    deleteTournament(id:ID!):TournamentDetails
    registerTournament(id:ID!):TournamentDetails

  }
`;
