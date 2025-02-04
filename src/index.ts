import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { Server } from "socket.io";

const app = express();
const prisma = new PrismaClient();

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");
});

app.get("/", async (req, res) => {
  res.send("<h1>Hello</h1>");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
