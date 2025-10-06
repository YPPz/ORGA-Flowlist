export function getSafeUser(user) {
    if (!user) return null;
    const {
        password,
        reset_token,
        reset_token_expire,
        provider_access_token,
        provider_refresh_token,
        ...safeUser
    } = user;
    return {
        ...safeUser,
        has_password: !!user.password,
    };
}