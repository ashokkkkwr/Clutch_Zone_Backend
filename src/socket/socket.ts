import { Server } from 'socket.io';
import HttpException from '../utils/HttpException.utils';
import { Message } from '../constant/messages';
import webTokenService from '../utils/webToken.service';
import { DotenvConfig } from '../config/env.config';

export class ChatSocket {
  private userSockets = new Map(); // Store user socket mappings

 

  setupSocket(server: any) {
    const io = new Server(server, {
      cors: {
        origin: '*', // You can restrict this in production
      },
    });
    console.log('🚀 Socket.IO server initialized');

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
      const userId = socket.data.user.id;
      console.log('🚀 New connection from user ID:', userId); // Log new connection
      this.userSockets.set(userId, socket.id);

      socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected`); // Log disconnection
        this.userSockets.delete(userId);
      });
      console.log('Current userSockets map:', this.userSockets); // Log the map to verify
    });

    return io; // Return the Socket.io instance
  }
 getUserSocket(id:string){
    console.log("🚀 ~ ChatSocket ~ getUserSocket ~ id:", id)
    console.log(this.userSockets.get(id))
    console.log(this.userSockets,"use sockets")
    return this.userSockets
  }
  getSocketInstance() {
    return this.userSockets;
  }
}
