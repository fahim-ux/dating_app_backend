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
import { connectToCassandra,disconnectFromCassandra,query } from "./db/d8_msg_db/connection";
import { connectToRedis,setData,getData,deleteData,checkIfKeyExists } from "./db/db_cache_db/connection";
import { InsertUser,findAllUsers } from "./db/db_meta_db/connection";

// start kafka locally
// bin\windows\kafka-server-start.bat config\server.properties


const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.static("public"));
// app.use(express.static(path.join(__dirname, "public")));
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
try {
  const user = {name:'Test-Agent',email:'no-reply@coderfolks.com'}
  InsertUser(prisma,user);
  // findAllUsers(prisma).then(() => {
  //   prisma.$disconnect();
  // });
  findAllUsers(prisma)
} catch (error) {  
  console.error('Error connecting to Neon-DB', error);
}
// connectKafka().catch(console.error);
// startKafkaConsumer().catch((err) => {
//   console.error("Error starting Kafka consumer:", err);
// });
// try {
//   connectToCassandra().then(() => {
//     query().then(() => {
//       disconnectFromCassandra();
//     });
//   });
// } catch (error) {
//   console.error('Error connecting to Cassandra', error);
// }

// const redis = connectToRedis();
// setData(redis, 'test', 'Hii Redis from backend').then(() => {
//   getData(redis, 'test').then((data) => {
//     console.log('Data fetched:', data);
//     // deleteData(redis, 'test').then(() => {
//     // });
//     checkIfKeyExists(redis, 'test').then((exists) => {
//       console.log('Key exists:', exists);
//     });
//   });
// });




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

app.get("/", async (req, res)=> {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});
app.get("/test", async (req, res)=> {
  res.sendFile(path.join(process.cwd(), "public", "test_chat.html"));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
