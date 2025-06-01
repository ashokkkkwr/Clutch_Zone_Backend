import {createServer} from 'http';
import app from './config/app.config';
import {DotenvConfig} from './config/env.config';
import Print from './utils/print';
// import {ChatSocket} from './socket/socket';
// import redisClient from './redisClient'; // <-- import redis client
import {initializeSocket} from './socket/sockets'; // <-- import socket
import { CronService } from './services/cron.service'; // <-- import cron service

// const chatSocket = new ChatSocket();
const cronService = new CronService(); // <-- initialize cron jobs


function listen() {
  const PORT = DotenvConfig.PORT;
  const httpServer = createServer(app);
  initializeSocket(httpServer);

  httpServer.listen(PORT);
  Print.info(`🚀 Server is listening on port ${DotenvConfig.PORT}`);
}

listen()

// async function testRedis() {
//   await redisClient.set('greeting', 'Hello Redis!');
//   const value = await redisClient.get('greeting');
//   console.log('Redis value:', value); // 👉 Output: Hello Redis!
// }

// testRedis();