import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { Server } from "socket.io";
import path from "path";
import handleChat from "./events/handleChat";
import { onlineUsers, lastSeen, allUsers } from "./utils/onlineUsers";
import { connectKafka } from "./kafka/kafka";
import { startKafkaConsumer } from './kafka/consumer';
import { connectToCassandra, disconnectFromCassandra, query } from "./db/d8_msg_db/connection";
import { connectToRedis, setData, getData, deleteData, checkIfKeyExists } from "./db/db_cache_db/connection";
import { find_User_Id, update_status, CreateUser, findAllUsers, verify_user } from "./db/db_meta_db/connection";
import { use } from "passport";

// start kafka locally
// bin\windows\kafka-server-start.bat config\server.properties


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

export const prisma = new PrismaClient();
export const redis = connectToRedis();
export const cassandra = connectToCassandra();
// export const kafka = connectKafka();

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.get("/", async (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});
app.get("/test", async (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "chat.html"));
});
app.get("/register", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "registration.html"));
});
app.get("/login", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "login.html"));
});

app.post("/api/register", async (req, res) => {
  console.log("Api call received at /api/register");
  try {
    console.log("Request body:", req.body);
    const { phone_number, username, profile_picture } = req.body;
    if (!phone_number) {
      res.status(400).json({ error: "Phone number is required" });
      return;
    }

    await CreateUser(prisma, { phone_number, user_name: username || '', profile_picture: profile_picture || '', is_online: true });

    res.status(201).json({ message: "User registered successfully" });

  } catch (error: any) {
    console.error("Error registering user:", error);
    if (error.code === 'P2002') {
      res.status(409).json({ error: "Phone number or username already exists" });
      return;
    }
    res.status(500).json({ error: "Failed to register user" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await findAllUsers(prisma);
    // res.send(`${users[0].phone_number}`);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


app.post("/api/login", async (req, res) => {
  console.log("Api call received at /api/login");
  try {
    console.log("Request body:", req.body);
    const { phone_number, username } = req.body;
    if (!phone_number || !username) {
      res.status(400).json({ error: "Phone number is required" });
      return;
    }
    const user = await verify_user(prisma, { phone_number: phone_number as string });
    if (user?.username === username) {
      res.status(200).json({ message: "User verified successfully", data: user });
    }
    else {
      res.status(401).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Failed to login user" });
  }
});





io.on("connection", (socket) => {

  // user connects
  socket.on("user_connected", async ({ phn_no }) => {
    try {
      const user_id = await find_User_Id(prisma, phn_no);
      if (!user_id) {
        console.error(`User not found for phone number: ${phn_no}`);
        return;
      }
      console.log("User Id found:", user_id);

      await redis.set(`user_${user_id}`, true);

      await update_status(prisma, phn_no, true);

      console.log(`User ${phn_no} connected`);

      socket.broadcast.emit("user_status", {
        phn_no,
        is_online: true,
      });

      console.log("Server : User connected: ", user_id);

    } catch (error) {
      console.error("Error handling user connection:", error);
    }
  });

  socket.on("get_all_users", () => {
    console.log("All users requested by client");

    fetch("http://localhost:3000/api/users") // Ensure the correct port
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        socket.emit("all_users", data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  });



  handleChat(io, socket);





  // user disconnected
  socket.on("user_disconnected", async ({ phn_no }) => {
    try {
      const user_id = await find_User_Id(prisma, phn_no);

      if (!user_id) {
        console.error(`User not found for phone number: ${phn_no}`);
        return;
      }

      console.log("User Id found:", user_id);

      await redis.del(`user_${user_id}`);

      await update_status(prisma, phn_no, false);

      console.log(`User ${phn_no} disconnected`);

      socket.broadcast.emit("user_status", {
        user_id,
        is_online: false,
      });

    } catch (error) {
      console.error("Error handling user disconnection:", error);
    }
  });
});









const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
