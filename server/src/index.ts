import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const port = 8000;
const server = createServer(app);

// making a circuit
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

// connection
io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);

  // greetings
  // socket.emit("greetings", {
  //   message: `Welcome, ${socket.id}`,
  // });

  // listen up from the client - message
  socket.on("message", ({ message }: { message: string }) => {
    io.emit("message-broadcast", {
      message: `A new message from ${socket.id} - ${message}`,
    });
  });

  // user - particular
  socket.on("message-particular", (data) => {
    socket.to(data.room).emit("message-particular", {
      message: `A new message from ${socket.id} - ${data.message}`,
    });
  });

  // user - join room
  socket.on("join-room", (data) => {
    socket.join(data.roomId);
    socket.emit("message", {
      message: `Welcome to ${data.roomId}`,
    });
  });
});

server.listen(port, () => {});
