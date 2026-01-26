// backend/middleware/auth.js
import jwt from "jsonwebtoken";

export function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;
  
  console.log("🔐 Auth middleware - Authorization header:", authHeader ? "Present" : "Missing");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ Auth failed: No Bearer token");
    return res.status(401).json({ message: "Token required" });
  }

  const token = authHeader.split(" ")[1];
  console.log("🔑 Token extracted:", token ? token.substring(0, 20) + "..." : "None");
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verified for user:", payload.id);
    req.user = payload; // { id, email }
    next();
  } catch (error) {
    console.log("❌ Token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
}
