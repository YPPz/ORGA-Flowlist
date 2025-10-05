export const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  if (process.env.NODE_ENV === "development") console.log("Unauthorized:", req.path);
  return res.status(401).json({ error: "Unauthorized" });
};