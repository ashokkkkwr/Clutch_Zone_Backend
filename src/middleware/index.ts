import compression from 'compression';
import cors from 'cors';
import express, { NextFunction, Request, Response, type Application } from 'express';
import path from 'path';
import { DotenvConfig } from '../config/env.config';
import { StatusCodes } from '../constant/statusCodes';
import routes from '../routes/index.route';
import { errorHandler } from './errorHandler.middleware';
import morgan from 'morgan';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from '../graphql/schema'; // GraphQL Schema
import { resolvers } from '../graphql/resolvers'; // GraphQL Resolvers
import bodyParser from 'body-parser';
import { authenticateGraphql } from './authentication.graphql';
import { PrismaClient } from '@prisma/client';
import BcryptService from '../utils/bcryptService';

const prisma = new PrismaClient();
// Define the GraphQL Context interface
interface GraphQLContext {
  req: Request;
  user?: {
    id?: string;
    role?: string;
  };
}

const middleware = async (app: Application) => {
  console.log('DotenvConfig.CORS_ORIGIN', DotenvConfig.CORS_ORIGIN);
  app.use(compression());
  app.use(
    cors({
      origin: DotenvConfig.CORS_ORIGIN,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use((req: Request, res: Response, next: NextFunction) => {
    const userAgent = req.headers['user-agent'];
    const apiKey = req.headers['apikey'];
    if (userAgent && userAgent.includes('Mozilla')) {
      next();
    } else {
      if (apiKey === DotenvConfig.API_KEY) next();
      else res.status(StatusCodes.FORBIDDEN).send('Forbidden');
    }
  });

  app.use(
    express.json({
      limit: '10mb',
    })
  );

  app.use(morgan('common'));
  app.use(express.urlencoded({ extended: false }));

  // Apollo Server Initialization
  const graphqlServer = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
  });

  await graphqlServer.start();
  app.use(
    '/graphql',
    bodyParser.json(),
    expressMiddleware(graphqlServer, {
      context: async ({ req }) => {
        const { user } = await authenticateGraphql(req, {} as Response, () => {});
        console.log("🚀 ~ context: ~ user:", user)
        if (!user) {
          console.error("User not authenticated");
        }
        return { req, user };
      },
    })
  );

const findIfExists= await prisma.user.findFirst({
  where:{
    email: 'admin@gmail.com'
  }
})
const password='admin'
  const hash = await BcryptService.hash(password);
  // const detele= await prisma.user.delete({
  //   where:{
  //     email: 'admin@gmail.com'
  //   }
  // })

  if(!findIfExists){
    const seedAdmin= await prisma.user.create({
      data:{
        email: 'admin@gmail.com',
        password: hash,
        username: 'admin',
        role: 'admin',
      }
    })
  }
 
  
  
  

  app.use('/api', routes);
  app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'uploads')));
  console.log('Static files path:', path.join(__dirname, '..', '..', 'uploads'));
 
  
  // app.use(express.static(path.join(__dirname, '../', '../', 'public/uploads')));

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../', 'views'));
  app.use('/', (_, res: Response) => {
    res.render('index');
  });

  app.use(errorHandler);
};

export default middleware;
