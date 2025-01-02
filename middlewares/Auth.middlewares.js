import jwt from "jsonwebtoken";
import { email, JWT } from "../config/env.js";
import { UserModel } from "../models/user.js";

export default async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: 0,
        msg: "Authorization header missing",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: 0,
        msg: "Token missing",
      });
    }

    // Verify the token
    const validate = jwt.verify(token, JWT);
    console.log(validate)
    // Check if the user exists in the database
    const user = await UserModel.findOne({ email: validate });
    if (!user || !user.isVerified) {
      return res.status(403).json({
        success: 0,
        msg: "Access denied. Please verify your account.",
      });
    }

    // Attach user information to the request object
    req.user = {validate,user:user._id};

    // Call the next middleware
    next();
  } catch (err) {
    console.error("Error in auth middleware:", err.message);

    // Handle invalid token or other errors
    res.status(401).json({
      success: 0,
      msg: "Invalid or expired token",
    });
  }
}
