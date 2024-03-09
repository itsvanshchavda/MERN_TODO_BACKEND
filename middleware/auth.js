import jwt from "jsonwebtoken";
import { User } from "../model/user.js";
export const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(404).json({
      success: false,
      message: "Login into you account first",
    });
  }

  const decode = jwt.verify(token, process.env.SECRET_KEY);
  const user = await User.findById(decode.id);
  req.user = user;
  next();
};