import getPrismaInstance from "../utils/PrismaClient.js";

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

export { checkuser, onBoardUser, getAllUser };
