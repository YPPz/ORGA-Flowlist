import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";
import streamifier from "streamifier";
import bcrypt from "bcrypt";
import { getSafeUser } from "../helpers/getSafeUser.js";

const upload = multer();

export const uploadAvatarMiddleware = upload.single("avatar");


export const getAllUsers = async (req, res) => {
  try {
    const results = await User.getAllUsers();
    res.json({ success: true, data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};


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


export const updateUser = async (req, res) => {
  try {
    if (parseInt(req.params.id, 10) !== req.user.user_id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    console.log("req.body keys >>>", Object.keys(req.body));
    console.log("req.file >>>", req.file ? req.file.fieldname : null);

    const updateData = {};

    if (req.body.display_name) {
      updateData.display_name = req.body.display_name;
    }

    if (req.body.password) {
      if (!req.body.currentPassword) {
        return res.status(400).json({ success: false, message: "Current password is required" });
      }

      const results = await User.getUserById(req.user.user_id);
      const user = results[0];
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Invalid password update request" });
      }

      updateData.password = await bcrypt.hash(req.body.password, 10);

    }

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

export const deleteUser = async (req, res) => {
  if (parseInt(req.params.id, 10) !== req.user.user_id) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  try {
    const [user] = await User.getUserById(req.user.user_id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Check password only for normal login users
    const { password } = req.body || {};
    if (user.password) {
      if (!password) {
        return res.status(400).json({ success: false, message: "Password required to delete this account" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Incorrect password" });
      }
    } else if (user.provider) {
      console.log(`Deleting provider user (${user.user_id} ${user.email} ${user.provider})`);
    }

    // Delete avatar in Cloudinary if available
    if (user.avatar) {
      let public_id;

      if (user.provider === 'google') {
        public_id = `avatars/google_${user.provider_id}`;
      } else if (user.provider === 'facebook') {
        public_id = `avatars/facebook_${user.provider_id}`;
      } else {
        public_id = `avatars/user_${req.user.user_id}`;
      }
      
      try {
        const result = await cloudinary.uploader.destroy(public_id);
        console.log("Cloudinary delete result:", result);
      } catch (err) {
        console.error("Cloudinary delete failed:", err);
      }
    }

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