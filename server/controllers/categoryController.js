import Category from "../models/Category.js";

// ดึง category ทั้งหมดสำหรับ user
export const getCategories = (req, res) => {
  const userId = req.user.user_id;
  Category.getAllCategoriesByUser(userId)
    .then(results => res.json(results))
    .catch(() => res.status(500).json({ message: "Server error" }));
};

// สร้าง category ใหม่
export const createCategory = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Category name is required" });

    const category = await Category.createCategory({ name, user_id: userId });
    res.status(201).json({
      message: "Category created",
      categoryId: category.category_id,
      name: category.name
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// อัพเดท category ของ user
export const updateCategory = async (req, res) => {
  const userId = req.user.user_id;
  const { id } = req.params;
  const data = req.body;
  try {
    const result = await Category.updateCategory(id, userId, data);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Category not found or not authorized" });
    res.json({ message: "Category updated" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// ลบ category ของ user
export const deleteCategory = async (req, res) => {
  const userId = req.user.user_id;
  const { id } = req.params;
  try {
    const result = await Category.deleteCategory(id, userId);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Category not found or not authorized" });
    res.json({ message: "Category deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
