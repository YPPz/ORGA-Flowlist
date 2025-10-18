import express from "express";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/categoryController.js";
import { ensureAuth } from "../middlewares/auth.js";

const router = express.Router();

router.route("/")
    .get(ensureAuth, getCategories)
    .post(ensureAuth, createCategory)

router.route("/:id")
    .put(ensureAuth, updateCategory)
    .delete(ensureAuth, deleteCategory)

export default router;
