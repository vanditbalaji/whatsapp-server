import getPrismaInstance from "../utils/PrismaClient.js";
import { generateToken04 } from "../utils/TokenGenerator.js";

const checkuser = async (req, res, next) => {
  try {
    const email = req.body.userEmail;

    if (!email) {
      res.json({ message: "Email is required", status: false });
    }
    const prisma = getPrismaInstance();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.json({ message: "User is not found", status: false });
    } else {
      res.json({ message: "User Found", status: true, data: user });
    }
  } catch (err) {
    console.error(err);
  }
};

const onBoardUser = async (req, res, next) => {
  try {
    const { name, email, about, photoUrl } = req.body;
    if (!name && !email && !about && !photoUrl) {
      res.json({ message: "Email Name About and Photo URL is required" });
    }
    const prisma = getPrismaInstance();
    await prisma.user.create({ data: { name, email, about, photoUrl } });
    res.json({ message: "Success", status: true });
  } catch (err) {
    next(err);
  }
};

const getAllUser = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        about: true,
        photoUrl: true,
      },
    });
    const userGroupByInitialLetter = {};
    users.forEach((users) => {
      const initialLetters = users.name.charAt(0).toUpperCase();
      if (!userGroupByInitialLetter[initialLetters]) {
        userGroupByInitialLetter[initialLetters] = [];
      }
      userGroupByInitialLetter[initialLetters].push(users);
    });
    return res.status(200).send({ users: userGroupByInitialLetter });
  } catch (err) {
    next(err);
  }
};

const generateToken = async (req, res, next) => {
  try {
    const appId = parseInt(process.env.ZEGO_APP_ID);
    const serverSecret = process.env.ZEGO_SERVER_ID;
    const userId = req.params.userId;
    const effectiveTime = 3600;
    const payload = "";
    if (appId && serverSecret && userId) {
      const token = generateToken04(
        appId,
        userId,
        serverSecret,
        effectiveTime,
        payload
      );
      res.status(201).json({ token });
    }
    return res.status(400).send("USERID APPID AND SERVER SECRET IS REQUIRED");
  } catch (err) {}
};

export { checkuser, onBoardUser, getAllUser,generateToken };
