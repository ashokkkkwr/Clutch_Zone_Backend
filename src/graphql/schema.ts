import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String
    token: String
  }
  type Game{
  id:String
  game_name:String
  game_cover_image:String
  game_icon_image:String

  }

  type Query {
    hello: String
    getGames:[Game]
    

  }

  type Mutation {
    register(username: String!, email: String!, password: String!): User
    verifyOtp(otp: String!, email: String!): Boolean
    login(email:String!, password:String!):User
    getDetails:[User]
    deleteGame(id:ID!):Game
    
    

  }
`;
