import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";
import streamifier from "streamifier";
import bcrypt from "bcrypt";
import { getSafeUser } from "../helpers/getSafeUser.js";

// Multer middleware
const upload = multer(); // memory storage

export const uploadAvatarMiddleware = upload.single("avatar");

// GET all users
export const getAllUsers = async (req, res) => {
  try {
    const results = await User.getAllUsers();
    res.json({ success: true, data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

// GET user by id
export const getUserById = async (req, res) => {
  if (parseInt(req.params.id, 10) !== req.user.user_id) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  try {
    const results = await User.getUserById(req.params.id);
    const user = results[0];
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, data: getSafeUser(user) });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching user" });
  }
};

// CREATE user
export const createUser = async (req, res) => {
  const userData = req.body;
  if (!userData.email) return res.status(400).json({ success: false, message: "Email is required" });

  try {
    const existing = await User.findByEmail(userData.email);
    if (existing.length) return res.status(200).json({ success: true, data: existing[0] });

    const result = await User.createUser(userData);
    res.status(201).json({ success: true, message: "User created successfully", data: { ...userData, user_id: result.insertId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error creating user" });
  }
};

// UPDATE user 
export const updateUser = async (req, res) => {
  try {
    if (parseInt(req.params.id, 10) !== req.user.user_id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    console.log("req.body keys >>>", Object.keys(req.body));
    console.log("req.file >>>", req.file ? req.file.fieldname : null);

    const updateData = {};

    // -------- Display Name --------
    if (req.body.display_name) {
      updateData.display_name = req.body.display_name;
    }

    // -------- Password --------
    if (req.body.password) {

      if (!req.body.currentPassword) {
        return res.status(400).json({ success: false, message: "Current password is required" });
      }

      const results = await User.getUserById(req.user.user_id);
      const user = results[0];
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      // เช็ค old password
      const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Invalid password update request" });
      }

      // hash new password
      updateData.password = await bcrypt.hash(req.body.password, 10);

    }
    //TODO: เพิ่ม bcrypt.compare กับ current password // ---- DONE ----

    // -------- Avatar --------
    if (req.file) {
      const streamUpload = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "avatars",
              public_id: `user_${req.user.user_id}`,
              overwrite: true
            },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

      const result = await streamUpload();
      updateData.avatar = result.secure_url;
    }

    const dbResult = await User.updateUser(req.user.user_id, updateData);
    if (dbResult.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User updated", data: updateData });
  } catch (err) {
    console.error("updateUser error:", err);
    res.status(500).json({ success: false, message: "Error updating user", error: err.message });
  }
};

// DELETE user
export const deleteUser = async (req, res) => {
  if (parseInt(req.params.id, 10) !== req.user.user_id) {
    return res.status(403).json({ success: false, message: "Forbidden: Cannot delete other users' accounts" });
  }

  try {
    // 1. ดึง public_id ของ avatar ก่อน
    const results = await User.getUserById(req.user.user_id);
    const user = results[0];
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // 2. ลบ avatar ใน Cloudinary (ถ้ามี)
    if (user.avatar) {
      // สมมติเราใช้ public_id แบบ "user_<user_id>"
      const public_id = `avatars/user_${req.user.user_id}`;
      await cloudinary.uploader.destroy(public_id);
    }

    // 3. ลบ user จาก DB
    const result = await User.deleteUser(req.user.user_id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
};