import express from 'express';
import { ensureAuth } from "../middlewares/auth.js";
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, uploadAvatarMiddleware } from '../controllers/userController.js';

const router = express.Router();

router.get("/", ensureAuth, getAllUsers);
router.get("/:id", ensureAuth, getUserById);
router.post("/", createUser);
router.put("/:id", ensureAuth, uploadAvatarMiddleware, updateUser); 
router.delete("/:id", ensureAuth, deleteUser);

export default router;
