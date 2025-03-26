import { Server } from 'socket.io';
import HttpException from '../utils/HttpException.utils';
import { Message } from '../constant/messages';
import webTokenService from '../utils/webToken.service';
import { DotenvConfig } from '../config/env.config';

export class ChatSocket {
  private userSockets = new Map();
  setupSocket(server: any) {
    const io = new Server(server, {
      cors: {
        origin: '*', 
      },
    });
    io.use((socket, next) => {
      
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(HttpException.unauthorized(Message.notAuthorized));
      }
      try {
        const payload = webTokenService.verify(token, DotenvConfig.ACCESS_TOKEN_SECRET);
        if (payload) {
          socket.data.user = payload;
          next();
        } else {
          return next(HttpException.unauthorized(Message.notAuthorized));
        }
      } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
          return next(HttpException.unauthorized(Message.tokenExpired));
        } else {
          return next(HttpException.unauthorized(Message.notAuthorized));
        }
      }
    });

    io.on('connection', async (socket) => {
      const token = socket.handshake.auth.token;
      const payload = webTokenService.verify(token, DotenvConfig.ACCESS_TOKEN_SECRET);
      const userId = payload.id;
      this.userSockets.set(userId, socket.id);

      socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected`);
        this.userSockets.delete(userId);
      });
      console.log('Current userSockets map:', this.userSockets); 
    });

    return io; // Return the Socket.io instance
  }
 getUserSocket(id:string){
    return this.userSockets
  }
  getSocketInstance() {
    return this.userSockets;
  }
}
