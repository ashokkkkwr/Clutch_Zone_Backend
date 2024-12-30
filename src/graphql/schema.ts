import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String
    role:String
  }
    type Login{
    user:User,
    token:String,
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

  type Query {
    hello: String
    getGames:[Game]
    getTournaments:[TournamentDetails]
    

  }

  type Mutation {
    register(username: String!, email: String!, password: String!): User
    verifyOtp(otp: String!, email: String!): Boolean
    login(email:String!, password:String!):Login
    getDetails:[User]
    deleteGame(id:ID!):Game
    getTournament(id:ID!):TournamentDetails
    deleteTournament(id:ID!):TournamentDetails

    
    
    

  }
`;
