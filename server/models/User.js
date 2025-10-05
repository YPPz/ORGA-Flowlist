import db from "../config/db.js";

const User = {
    getAllUsers: () => new Promise((resolve, reject) =>
        db.query("SELECT * FROM users", (err, results) =>
            err ? reject(err) : resolve(results)
        )),
    getUserById: (id) => new Promise((resolve, reject) =>
        db.query("SELECT * FROM users WHERE user_id=?", [id], (err, results) =>
            err ? reject(err) : resolve(results)
        )),
    createUser: (data) => new Promise((resolve, reject) => {
        const { email, display_name, password, provider, provider_id, avatar, provider_access_token, provider_refresh_token } = data;
        const query = `INSERT INTO users (email, display_name, password, provider, provider_id, avatar, provider_access_token, provider_refresh_token ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(query, [email, display_name, password || null, provider || null, provider_id || null, avatar || null, provider_access_token || null, provider_refresh_token || null], (err, result) => err ? reject(err) : resolve(result));
    }),
    updateUser: (id, data) => new Promise((resolve, reject) =>
        db.query("UPDATE users SET ? WHERE user_id=?", [data, id], (err, result) =>
            err ? reject(err) : resolve(result)
        )),
    deleteUser: (id) => new Promise((resolve, reject) =>
        db.query("DELETE FROM users WHERE user_id=?", [id], (err, result) =>
            err ? reject(err) : resolve(result)
        )),
    findByEmail: (email) => new Promise((resolve, reject) =>
        db.query("SELECT * FROM users WHERE email=?", [email], (err, results) =>
            err ? reject(err) : resolve(results)
        )),
    findByProviderId: (provider, providerId) => new Promise((resolve, reject) =>
        db.query("SELECT * FROM users WHERE provider=? AND provider_id=?", [provider, providerId], (err, results) =>
            err ? reject(err) : resolve(results)
        )),
    updateTokens: async (id, accessToken, refreshToken) => {
        const results = await new Promise((resolve, reject) => {
            db.query(
                "SELECT provider_refresh_token FROM users WHERE user_id=?",
                [id],
                (err, res) => err ? reject(err) : resolve(res)
            );
        });
        const existingRefreshToken = results[0]?.provider_refresh_token;
        return new Promise((resolve, reject) => {
            db.query(
                "UPDATE users SET provider_access_token=?, provider_refresh_token=? WHERE user_id=?",
                [accessToken, refreshToken || existingRefreshToken, id],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },
    // หา user ด้วย reset_token (hash)
    findByResetToken: (tokenHash) => new Promise((resolve, reject) =>
        db.query(
            "SELECT * FROM users WHERE reset_token=? AND reset_token_expire > NOW()",
            [tokenHash],
            (err, results) => (err ? reject(err) : resolve(results))
        )
    ),
    // เซ็ต reset token + expire
    setResetToken: (userId, tokenHash, expire) => new Promise((resolve, reject) =>
        db.query(
            "UPDATE users SET reset_token=?, reset_token_expire=? WHERE user_id=?",
            [tokenHash, expire, userId],
            (err, result) => (err ? reject(err) : resolve(result))
        )
    ),
};

export default User;
