import { Router } from "express";
import {
  checkuser,
  generateToken,
  getAllUser,
  onBoardUser,
} from "../controllers/AuthController.js";
import { generateToken04 } from "../utils/TokenGenerator.js";

const router = Router();

router.post("/check-user", checkuser);
router.post("/onboard-user", onBoardUser);
router.get("/get-all-users", getAllUser);
router.get("/generate-token/:userId", generateToken);
export default router;
