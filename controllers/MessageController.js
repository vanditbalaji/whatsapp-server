import getPrismaInstance from "../utils/PrismaClient.js";
import { renameSync } from "fs";
const addMessage = async (req, res, next) => {
  try {
    const { message, sender: from, receiver: to } = req.body;
    const prisma = getPrismaInstance();
    const getUser = onlineUsers.get(to);
    if (message && from && to) {
      const newMessage = await prisma.message.create({
        data: {
          message,
          sender: { connect: { id: parseInt(from) } },
          receiver: { connect: { id: parseInt(to) } },
          messageStatus: getUser ? "delivered" : "sent",
        },
        include: { sender: true, receiver: true },
      });

      return res.status(201).send({ message: newMessage });
    } else {
      return res
        .status(400)
        .send({ message: "From, to, and Message are required" });
    }
  } catch (err) {
    next(err);
  }
};

const getMessage = async (req, res, next) => {
  const { from, to } = req.query;
  try {
    const prisma = getPrismaInstance();
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: parseInt(from),
            receiverId: parseInt(to),
          },
          {
            senderId: parseInt(to),
            receiverId: parseInt(from),
          },
        ],
      },
      orderBy: {
        id: "asc",
      },
    });

    const unreadMessage = [];
    messages.forEach((message, index) => {
      if (
        message.messageStatus !== "read" &&
        message.senderId === parseInt(to)
      ) {
        messages[index].messageStatus = "read";
        unreadMessage.push(message.id);
      }
    });

    await prisma.message.updateMany({
      where: {
        id: { in: unreadMessage },
      },
      data: {
        messageStatus: "read",
      },
    });
    res.status(200).send({ messages });
  } catch (err) {
    next(err);
  }
};

const addImageMessage = async (req, res, next) => {
  try {
    if (req.file) {
      const date = Date.now();
      let fileName = "uploads/images/" + date + req.file.originalname;


      renameSync(req.file.path, fileName);
      const prisma = getPrismaInstance();
      const { from, to } = req.query;
      if (from && to) {
        const message = await prisma.message.create({
          data: {
            message: fileName,
            type: "image",
            sender: { connect: { id: parseInt(from) } },
            receiver: { connect: { id: parseInt(to) } },
          },
        });

        return res.status(201).json({ message });
      }
      return res.status(400).json("From and To is required.");
    }
    return res.status(400).json("Audio is required. ");
  } catch (err) {
    next(err);
  }
};

const addAudioMessage = async (req, res, next) => {

  try {
    if (req.file) {
      const date = Date.now();
      let fileName = "uploads/recordings/" + date + req.file.originalname;

      renameSync(req.file.path, fileName);
      const prisma = getPrismaInstance();
      const { from, to } = req.query;
      if (from && to) {
        const message = await prisma.message.create({
          data: {
            message: fileName,
            type: "audio",
            sender: { connect: { id: parseInt(from) } },
            receiver: { connect: { id: parseInt(to) } },
          },
        });

        return res.status(201).json({ message });
      }
      return res.status(400).json("From and To is required.");
    }
    return res.status(400).json("Audio is required. ");
  } catch (err) {
    next(err);
  }
};

const getInitialContactWithMessage = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.from);

    const prisma = getPrismaInstance();

    const user = await prisma.user?.findUnique({
      where: { id: userId },
      include: {
        sentMessage: {
          include: {
            receiver: true,
            sender: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        receivedMessage: {
          include: {
            receiver: true,
            sender: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });


    const message = [...user.sentMessage, ...user.receivedMessage];
    message.sort((a, b) => b.createdAt?.getTime() - a.createAt?.getTime());
    const users = new Map();
    const messageStatusChanged = [];
    message.forEach((msg) => {
      const {
        id,
        type,
        message,
        messageStatus,
        createdAt,
        senderId,
        receiverId,
      } = msg;

      const isSender = msg.senderId === userId;
      const calculatedId = isSender ? message.receiverId : msg.senderId;

      if (msg.messageStatus === "sent") {
        messageStatusChanged.push(msg.id);
      }

      if (!users.get(calculatedId)) {
        let user = {
          messageId: id,
          type,
          message,
          messageStatus,
          createdAt,
          senderId,
          receiverId,
        };
        if (isSender) {
          user = {
            ...user,
            ...msg.receiver,
            totalUnreadMessages: 0,
          };
        } else {
          user = {
            ...user,
            ...msg.sender,
            totalUnreadMessages: messageStatus !== "read" ? 1 : 0,
          };
        }
        users.set(calculatedId, { ...user });
      } else if (messageStatus !== "read" && isSender) {
        const user = users.get(calculatedId);
        users.set(calculatedId, {
          ...user,
          totalUnreadMessages: user.totalUnreadMessages + 1,
        });
      }
    });

    if (messageStatusChanged.length) {
      await prisma.message.updateMany({
        where: {
          id: { in: messageStatusChanged },
        },
        data: {
          messageStatus: "delivered",
        },
      });
    }

    return res.status(200).json({
      user: Array.from(users.values()),
      onlineUsers: Array.from(users.values(onlineUsers.keys())),
    });
  } catch (err) {
    next(err);
  }
};

export {
  addMessage,
  getMessage,
  addImageMessage,
  addAudioMessage,
  getInitialContactWithMessage,
};
