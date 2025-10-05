import db from "../config/db.js";

const Category = {
  getAllCategoriesByUser: (userId) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM categories WHERE type='system' OR user_id=?`;
      db.query(query, [userId], (err, results) => err ? reject(err) : resolve(results));
    });
  },

  createCategory: (data) => {
    const { name, user_id } = data;
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO categories (name, type, user_id) VALUES (?, 'custom', ?)`;
      db.query(query, [name, user_id], (err, result) => {
        if (err) return reject(err);
        db.query(`SELECT * FROM categories WHERE category_id=?`, [result.insertId], (err2, rows) => err2 ? reject(err2) : resolve(rows[0]));
      });
    });
  },

  updateCategory: (id, user_id, data) => {
    return new Promise((resolve, reject) => {
      db.query(`UPDATE categories SET ? WHERE category_id=? AND user_id=?`, [data, id, user_id], (err, result) => err ? reject(err) : resolve(result));
    });
  },

  deleteCategory: (id, user_id) => {
    return new Promise((resolve, reject) => {
      db.query(`DELETE FROM categories WHERE category_id=? AND user_id=?`, [id, user_id], (err, result) => err ? reject(err) : resolve(result));
    });
  }
};

export default Category;
