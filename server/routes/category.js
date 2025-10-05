import express from "express";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/categoryController.js";
import { ensureAuth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", ensureAuth, getCategories);
router.post("/", ensureAuth, createCategory);
router.put("/:id", ensureAuth, updateCategory);
router.delete("/:id", ensureAuth, deleteCategory);

export default router;
