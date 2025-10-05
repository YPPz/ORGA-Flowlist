const API_URL = import.meta.env.VITE_API_URL;

export const register = async (display_name, email, password) => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ display_name, email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || "Registration failed");
        }
        return data;
    } catch (err) {
        throw new Error(err.message || "Error connecting to server");
    }
};

export const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    return data;
};

export const forgotPassword = async (email) => {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
    return await res.json();
};

export const resetPassword = async (token, password) => {
    const res = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
    });
    return await res.json();
};


export const facebookLogin = () => {
    window.open(`${API_URL}/auth/facebook`, "_self");
};

export const googleLogin = () => {
    window.open(`${API_URL}/auth/google`, "_self");
};

