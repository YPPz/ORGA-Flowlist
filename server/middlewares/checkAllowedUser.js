/**
 * Middleware: checkAllowedUser
 * -------------------------------------------
 * This middleware restricts access to local login and registration
 * to a predefined list of allowed users specified in `.env` under `ALLOWED_USERS`.
 *
 * Usage:
 *  - Applied to local login and register routes.
 *  - Useful for internal/demo environments or private deployments.
 *
 * Example:
 *  ALLOWED_USERS=demo@gmail.com,admin@example.com
 */
export const checkAllowedUser = (req, res, next) => {
    const allowedUsers = process.env.ALLOWED_USERS?.split(',') || [];
    const email = req.body.email;

    if (!allowedUsers.includes(email)) {
        return res.status(403).json({ success: false, message: "Access denied" });
    }

    next();
};


/**
 * Middleware: checkAllowedOAuthUser
 * -------------------------------------------
 * This middleware performs the same email-based restriction as `checkAllowedUser`,
 * but is specifically designed for OAuth logins (Google and Facebook).
 *
 * Behavior:
 *  - Executes **after** successful OAuth authentication via Passport.
 *  - Reads `req.user.email` from the OAuth provider.
 *  - If the email is not included in the `ALLOWED_USERS` list, the user is redirected
 *    back to the client with an "Access denied" message.
 *
 * Purpose:
 *  - Ensures that only whitelisted accounts can log in via Google or Facebook OAuth.
 */
export const checkAllowedOAuthUser = (req, res, next) => {
    const allowedUsers = process.env.ALLOWED_USERS?.split(',') || [];
    const email = req.user?.email;

    console.log('🟡 OAuth email:', email);
    console.log('🟢 Allowed users:', allowedUsers);

    if (!email) {
        console.log('❌ No email found in req.user');
        return res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent("No email found from OAuth provider.")}`);
    }

    if (!allowedUsers.includes(email)) {
        console.log('🚫 Access denied for', email);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent("Access denied for this account.")}`);
    }

    next();
};
