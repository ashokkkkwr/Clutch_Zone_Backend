import userService from '../services/user.service';

export const resolvers = {
  Query: {
    hello: () => "Hello World.",
  },
  Mutation: {
    register: async (_: any, { username, email, password }: { username: string; email: string; password: string }) => {
      return userService.register(username, email, password);
    },
    // Uncomment and implement the login logic as needed
    // login: async (_, { email, password }: { email: string; password: string }) => {
    //   return userService.login(email, password);
    // },
  },
};
