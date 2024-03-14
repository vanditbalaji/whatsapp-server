import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import AuthRoutes from "./routes/AuthRoutes.js";
import MessageRoutes from "./routes/MessageRoutes.js";
import { Server } from "socket.io";
const app = express();

dotenv.config();

app.use(express.json());
app.use(cors());

app.use("/uploads/recordings/", express.static("uploads/recordings"));
app.use("/uploads/images/", express.static("uploads/images"));

// app.use(
//   "/uploads/recordings/",
//   express.static("uploads/recordings", {
//     setHeaders: (res) => {
//       res.setHeader("Accept-Ranges", "bytes");
//     },
//   })
// );

app.use("/api/auth", AuthRoutes);
app.use("/api/messages", MessageRoutes);

app.get("/", (req, res) => {
  const message = `Hello World! I'm the server.`;
  res.send(message);
});

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;

  socket.on("add-user", (userid) => {
    onlineUsers.set(userid, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.receiverId);

    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-receive", {
        senderId: data.senderId,
        receiverId: data.receiverId,
        message: data.message,
        id: data.id,
        type: data.type,
        messageStatus: data.messageStatus,
        createdAt: data.createdAt,
      });
    }
  });

  socket.on("outgoing-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-voice-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });

  socket.on("outgoing-video-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-video-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });

  socket.on("reject-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.from);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("voice-call-rejected");
    }
  });

  socket.on("reject-video-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.from);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("video-call-rejected");
    }
  });

  socket.on("accept-incoming-call", ({ id }) => {
    const sendUserSocket = onlineUsers.get(id);

    socket.to(sendUserSocket).emit("accept-call");
  });
});
