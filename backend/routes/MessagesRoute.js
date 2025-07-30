import {Router} from "express"
import {verifyToken} from "../middlewares/AuthMiddleware.js"
import { getMessages, uploadFile } from "../controllers/MessagesController.js"
import multer from 'multer'

const messageRoutes = Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
                  cb(null, "uploads/files/"); // Folder where files will be stores
                    },

  filename: (req, file, cb) => {
                  const name = Date.now() + file.originalname;
                  cb(null, name);
              }
          });

const upload = multer({storage});

messageRoutes.post("/get-messages", verifyToken, getMessages)
messageRoutes.post("/upload-file", verifyToken, upload.single("file"), uploadFile)


export default messageRoutes