import { Router } from "express";
import {
  checkuser,
  getAllUser,
  onBoardUser,
} from "../controllers/AuthController.js";

const router = Router();

router.post("/check-user", checkuser);
router.post("/onboard-user", onBoardUser);
router.get("/get-all-users", getAllUser);
export default router;
