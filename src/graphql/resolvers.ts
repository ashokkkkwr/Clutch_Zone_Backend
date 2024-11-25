import userService from '../services/user.service';

export const resolvers = {
  Query: {
    hello: () => "Hello World.",
  },
  Mutation: {
    register: async (
      _: any,
      { username, email, password }: { username: string; email: string; password: string },
      { req }: { req: any } // Access req from context
    ) => {
    //   const activationUrl = `${req.headers.origin}/activation?token=activationTokenPlaceholder`;
      return userService.register(username, email, password);
    },
  },
}