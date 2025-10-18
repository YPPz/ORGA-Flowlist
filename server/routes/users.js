import express from 'express';
import { ensureAuth } from "../middlewares/auth.js";
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, uploadAvatarMiddleware } from '../controllers/userController.js';

const router = express.Router();

router.route("/")
    .get(ensureAuth, getAllUsers)
    .post(createUser)
router.route("/:id")
    .get(ensureAuth, getUserById)
    .put(ensureAuth, uploadAvatarMiddleware, updateUser)
    .delete(ensureAuth, deleteUser)

export default router;
