import {createServer} from 'http';
import app from './config/app.config';
import {DotenvConfig} from './config/env.config';
import Print from './utils/print';
// import {ChatSocket} from './socket/chatSocket';

// const chatSocket = new ChatSocket();

function listen() {
  const PORT = DotenvConfig.PORT;
  const httpServer = createServer(app);
  // chatSocket.setupSocket(httpServer);
  httpServer.listen(PORT);
  Print.info(`🚀 Server is listening on port ${DotenvConfig.PORT}`);
}
listen()