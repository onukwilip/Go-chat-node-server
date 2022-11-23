const express = require("express");
const app = express();
const port = process.env.PORT || 3002;
var http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://admin.socket.io",
      "https://gochat-tau.vercel.app",
    ],
    methods: ["GET", "POST"],
    "Access-Control-Allow-Credentials": true,
  },
});

const userIo = io.of("/user");

const chatRoomIo = io.of("/chatroom");

const discussionIo = io.of("/discussion");

const notification = io.of("/notification");

const socketHandler = (socket) => {
  socket.emit("connection", (message = "You are connected successfully"));
  console.log(`USER ${socket.id} CONNECTED SUCCESSFULLY`);

  socket.on("disconnection", () => {
    console.log(`USER ${socket.id} DISCONNECTED SUCCESSFULLY`);
  });
};

const userHandler = (socket) => {
  socket.emit(
    "connection",
    (message = "You are connected to user namespace successfully")
  );
  console.log(`USER ${socket.id} CONNECTED TO USER NAMESPACE SUCCESSFULLY`);

  socket.on("disconnection", () => {
    console.log(
      `USER ${socket.id} DISCONNECTED FROM USER NAMESPACE SUCCESSFULLY`
    );
  });
};

const chatroomHandler = (socket) => {
  socket.emit(
    "connection",
    (message = "You are connected to chatroom namespace successfully")
  );
  console.log(`USER ${socket.id} CONNECTED TO CHATROOM NAMESPACE SUCCESSFULLY`);

  socket.on("disconnection", () => {
    console.log(
      `USER ${socket.id} DISCONNECTED FROM CHATROOM NAMESPACE SUCCESSFULLY`
    );
  });

  socket.on("chat", (chat) => {
    chatRoomIo
      .to(chat?.ChatroomID)
      .emit("chat_sent", (message = "chat recieved"));
  });

  socket.on("join", (roomID) => {
    socket.join(roomID);
    console.log(`USER WITH ${socket?.id} JOINED CHATROOM ${roomID}`);
  });
};

const discussionHandler = (socket) => {
  socket.emit(
    "connection",
    (message = "You are connected to discussion namespace successfully")
  );
  console.log(
    `USER ${socket.id} CONNECTED TO DISCUSSION NAMESPACE SUCCESSFULLY`
  );

  socket.on("disconnection", () => {
    console.log(
      `USER ${socket.id} DISCONNECTED FROM DISCUSSION NAMESPACE SUCCESSFULLY`
    );
  });

  socket.on("new-discussion", () => {
    discussionIo.emit("new-discussion");
  });
};

const notificationHandler = (socket) => {
  socket.emit(
    "connection",
    (message = "You are connected to notification namespace successfully")
  );

  console.log(
    `USER ${socket.id} CONNECTED TO NOTIFICATION NAMESPACE SUCCESSFULLY`
  );

  socket.on("join", (userid) => {
    socket.join(userid);

    console.log(`USER ${socket.id} JOINED ${userid} SUCCESSFULLY`);
  });

  socket.on("notify", (userid) => {
    socket.to(userid).emit("notification");
  });
};

discussionIo.on("connection", discussionHandler);

userIo.on("connection", userHandler);

chatRoomIo.on("connection", chatroomHandler);

notification.on("connection", notificationHandler);

io.on("connection", socketHandler);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
