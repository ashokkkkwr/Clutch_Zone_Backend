import { Server } from "socket.io";
import webTokenService from '../utils/webToken.service';
import { DotenvConfig } from "../config/env.config";
import HttpException from "../utils/HttpException.utils";
import Print from "../utils/print";

let io: Server;

function initializeSocket(server: any) {
  Print.info("Socket Initialized");
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket, next) => {
    const socketToken = socket.handshake.auth.token;
    console.log("🚀 ~ io.use ~ socketToken:", socketToken);
    if (!socketToken) {
      return next(new Error("You are not authorized"));
    }
    try {
      const auth = webTokenService.verify(
        socketToken,
        DotenvConfig.ACCESS_TOKEN_SECRET,
      );
      if (auth) {
        socket.data.user = auth;
        next();
      } else {
        next(new Error("You are not authorized"));
      }
    } catch (error) {
      next(new Error("Token verification failed"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.data.user.id;
    console.log(`User connected: ${userId} | Socket ID: ${socket.id}`);

    socket.join(userId);

    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${userId} | Socket ID: ${socket.id}`);
    });
  });
}

// Function to get the socket ID by user ID
async function getSocketIdByUserId(userId: string): Promise<string | null> {
  if (!io) throw new HttpException("Socket server not initialized", 500);
  const sockets = await io.in(userId).fetchSockets();
  if (sockets.length > 0) {
    return sockets[0].id;
  }
  return null;
}

export { initializeSocket, io, getSocketIdByUserId };
