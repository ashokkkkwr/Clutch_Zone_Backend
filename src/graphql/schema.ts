import {gql} from 'apollo-server-express';

export const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    role: String!
    email: String
    token: String
  }

  type Game {
    id: String
    game_name: String
    game_cover_image: String
    game_icon_image: String
  }
  type Prize_pools {
    id: ID!
    prize: String
    placements: String
  }
  type Match {
    id: String
  }

  type Request {
    id: ID!
    team_id: ID!
    user_id: ID!
    status: String
    user: User
  }

  type TournamentDetails {
    id: String
    tournament_name: String
    tournament_icon: String
    tournament_cover: String
    tournament_description: String
    tournament_entry_fee: String
    tournament_start_date: String
    tournament_end_date: String
    tournament_registration_start_date: String
    tournament_registration_end_date: String
    tournament_game_mode: String
    tournament_streaming_link: String
    games: Game

    prize_pools:[Prize_pools]
  }

  type Team {
    id: ID!
    team_name: String!
    logo: String
    maxPlayers: Int
    description: String

    teamPlayers: [TeamPlayer]
  }
  type Gear {
    id: ID!
    name: String!
    description: String!
    price: String!
    image: String!
    stock: String!
  }

  type TeamPlayer {
    role: TeamPlayerRole!
    user: User!
  }
  enum TeamPlayerRole {
    PLAYER
    TEAM_LEADER
  }
  type OwnTeamDetails {
    id: ID!
    team_name: String!
    logo: String!
    max_players: Int!
    description: String
    wins: Int!
    tournaments_played: Int!
    teamPlayers: [TeamPlayer!]!
  }

  # Define params as a separate type
  type PaymentParams {
    amount: String
    tax_amount: String
    total_amount: String
    transaction_uuid: String
    product_code: String
    success_url: String
    failure_url: String
    signed_field_names: String
    signature: String
  }

  type PaymentData {
    paymentUrl: String
    params: PaymentParams # Fixed invalid inline object definition
  }
  # New input type for Esewa Payment Verification
  input EsewaPaymentVerificationInput {
    transaction_uuid: String!
    amount: String!
    product_code: String!
  }

  type EsewaPaymentVerificationResponse {
    success: Boolean!
    message: String
  }
  type Bucks {
    id: ID!
    amount: String
    price: String
    description: String
    bonus: String
    buckImage: String
  }

  type Query {
    hello: String
    getGames: [Game]
    getTournaments: [TournamentDetails]
    getUpcomingTournaments: [TournamentDetails]
    getOngoingTournaments: [TournamentDetails]
    getPastTournaments: [TournamentDetails]
    getTeams: [Team] # Changed from 'teams' to 'Team'
    getGears: [Gear]
    getOwnTeamDetails: OwnTeamDetails
    getTournament(id: ID!): TournamentDetails
    getClutchBucks: [Bucks]
    getPendingRequests: [Request!]! # Changed from 'requests' to 'Request'
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): User
    verifyOtp(otp: String!, email: String!): Boolean
    login(email: String!, password: String!): User
    getDetails: [User]
    deleteGame(id: ID!): Game
    deleteTournament(id: ID!): TournamentDetails
    registerTournament(id: ID!): TournamentDetails
    declareWinnerAndTime(id: ID!, winner_id: String): Boolean
    updateAmount(id:ID!):Boolean
    sendJoinRequest(teamId: ID!): Team # Changed from 'teams' to 'Team'
    acceptRequest(requestId: ID!): String
    rejectRequest(requestId: ID!): String
    initiateEsewaPayment(tournamentId: ID!): PaymentData
    verifyEsewaPayment(input: EsewaPaymentVerificationInput!): EsewaPaymentVerificationResponse
  }
`;
