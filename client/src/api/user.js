const API_URL = import.meta.env.VITE_API_URL;

export const getUser = async (userId) => {
  try {
    const res = await fetch(`${API_URL}/api/users/${userId}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch user");
    }

    return await res.json();
  } catch (err) {
    console.error("getUser error:", err.message);
    throw err;
  }
};

export const updateUser = async (userId, { display_name, currentPassword, password, avatarFile }) => {
  try {
    const formData = new FormData();

    if (display_name) formData.append("display_name", display_name);
    if (currentPassword) formData.append("currentPassword", currentPassword);
    if (password) formData.append("password", password);
    if (avatarFile) formData.append("avatar", avatarFile);

    const res = await fetch(`${API_URL}/api/users/${userId}`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to update user");
    }

    return await res.json();
  } catch (err) {
    console.error("updateUser error:", err.message);
    throw err;
  }
};


export const deleteUser = async (userId, password) => {
  try {
    const options = {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    };

    if (password) options.body = JSON.stringify({ password });

    const res = await fetch(`${API_URL}/api/users/${userId}`, options);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to delete user");
    }

    return await res.json();
  } catch (err) {
    console.error("deleteUser error:", err.message);
    throw err;
  }
};