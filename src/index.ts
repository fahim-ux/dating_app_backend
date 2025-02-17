import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { Server } from "socket.io";
import path from "path";
import handleChat from "./events/handleChat";
import { onlineUsers,lastSeen,allUsers } from "./utils/onlineUsers";
import { connectKafka } from "./kafka/kafka";
import { startKafkaConsumer } from './kafka/consumer';

// bin\windows\kafka-server-start.bat config\server.properties
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

connectKafka().catch(console.error);
startKafkaConsumer().catch((err) => {
  console.error("Error starting Kafka consumer:", err);
});

io.on("connection", (socket) => {
  console.log("Server : a user connected ",socket.id);
  let currentUserId : string | null = null;
  // socket.on('request_id',()=>{
  //   socket.emit('receive_id', socket.id)
  // })
  socket.on("user_connected", ({userId}) => {
    console.log("User connected with ID", userId);
    currentUserId = userId;
    onlineUsers.set(userId, socket.id);
    allUsers.add(userId);
    if (lastSeen.has(userId)) {
      lastSeen.delete(userId);
    }
    console.log(`User ${userId} is now online with socket ID ${socket.id}`);
    console.log("Current Online Users", onlineUsers);
    // io.emit("online_users", Array.from(onlineUsers.keys()));
    io.emit("all_users", Array.from(allUsers));
  });
  // socket.emit('recieve_id', socket.id)
  handleChat(io, socket);


  socket.on("disconnect", () => {
    if (currentUserId) {
      onlineUsers.delete(currentUserId);
      lastSeen.set(currentUserId, new Date().toISOString());
      console.log(`User ${currentUserId} disconnected at ${lastSeen.get(currentUserId)}`);
      io.emit("all_users", Array.from(allUsers));
    }
  });
});

app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
