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

// Define the GraphQL Context interface
interface GraphQLContext {
  req: Request;
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
  });

  await graphqlServer.start();

  app.use(
    '/graphql',
    bodyParser.json(),
    expressMiddleware(graphqlServer, {
      context: async ({ req }: { req: Request }): Promise<GraphQLContext> => ({ req }),
    })
  );

  app.use('/api', routes);

  app.use(express.static(path.join(__dirname, '../', '../', 'public/uploads')));
  app.use(express.static(path.join(__dirname, '../', '../', 'public')));

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../', 'views'));
  app.use('/', (_, res: Response) => {
    res.render('index');
  });

  app.use(errorHandler);
};

export default middleware;
