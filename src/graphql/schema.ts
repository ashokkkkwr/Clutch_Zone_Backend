import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String
    token: String
  }

  type Query {
    hello: String
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): User
    verifyOtp(otp: String!, email: String!): Boolean
  }
`;
