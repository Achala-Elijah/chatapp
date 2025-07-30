import { Router } from "express";
import { updateProfile, 
        getUserInfo, 
        login, 
        signup, 
        addProfileImage, 
        removeProfileImage,
        logout, 
    } from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from 'multer';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
                  cb(null, "uploads/profiles/"); // Folder where files will be stores
                    },

    filename: (req, file, cb) => {
                  const name = Date.now() + file.originalname;
                  cb(null, name);
              }
          });

const upload = multer({storage})



const authRoutes = Router()

authRoutes.post("/signup", signup)
authRoutes.post("/login", login)
authRoutes.get("/user-info", verifyToken, getUserInfo)
authRoutes.post("/update-profile", verifyToken, updateProfile)
authRoutes.post("/add-profile-image", verifyToken, upload.single("profile-image"), addProfileImage)
authRoutes.delete("/remove-profile-image", verifyToken, removeProfileImage)
authRoutes.post("/logout", logout)





export default authRoutes