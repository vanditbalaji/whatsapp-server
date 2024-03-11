import { Router } from "express";
import {
  addAudioMessage,
  addImageMessage,
  addMessage,
  getInitialContactWithMessage,
  getMessage,
} from "../controllers/MessageController.js";
import multer from "multer";
const router = Router();

const uploadImage = multer({ dest: "uploads/images" });
// Mistake
const upload = multer({ dest: "uploads/recordings" });

router.post("/add-message", addMessage);
router.get("/get-message", getMessage);
router.get("/get-initial-contacts/:from",getInitialContactWithMessage);
router.post("/add-image-message", uploadImage.single("image"), addImageMessage);
router.post("/add-audio-message", upload.single("audio"), addAudioMessage);
// const audioFileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("audio/")) {
//     cb(null, true);
//   } else {
//     cb(new Error("Invalid file type. Only audio files are allowed."), false);
//   }
// };

// const upload = multer({
//   dest: "uploads/recordings",
//   fileFilter: audioFileFilter,
// });

// router.post("/add-audio-message", upload.single("audio"), addAudioMessage);

export default router;
