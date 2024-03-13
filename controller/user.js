import { User } from "../model/user.js";
import bcrypt from "bcrypt";
import { setCookie } from "../utils/jwt.js";
import { createResetToken } from "../utils/resetTokem.js";
import { sendEmail } from "../utils/email.js";
import crypto from "crypto";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashPass = await bcrypt.hash(password, 10);

    let existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    let user = await User.create({
      name,
      email,
      password: hashPass,
    });

    setCookie(req, res, user, "Registered Successfully!");
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials!",
      });
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials!",
      });
    }

    setCookie(req, res, user, `Welcome Back! ${user.name}`, 200);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Error fetching user profile:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
export const logoutUser = (req, res) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
      secure: process.env.NODE_ENV === "development" ? false : true,
    })
    .json({
      success: true,
      message: "Logout Successfully",
    });
};

//forgot password

export const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  try {
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { passwordResetToken, passwordResetExpire, resetToken } =
      await createResetToken();

    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpire = passwordResetExpire;
    await user.save({ validateBeforeSave: false });

    // Send email
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v2/users/resetpassword/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. \n\n ${resetURL} this is reset link valid for 10 minutes`;

    await sendEmail({
      email: user.email,
      subject: "Password Change Reset",
      message,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
      resetToken,
    });
  } catch (err) {
    console.error("Error sending reset link:", err.message);

    if (user) {
      user.passwordResetToken = undefined;
      user.passwordResetExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const token = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      email: req.body.email,
      passwordResetToken: token,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token is expired or invalid",
      });
    }

    const hashPass = await bcrypt.hash(req.body.password, 10);

    user.password = hashPass;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    user.updatedAt = Date.now();

    await user.save();

    // Set cookies and send response
    let loginToken = setCookie(req, res, user, "Password reset successfully");
    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
      loginToken,
    });
  } catch (err) {
    console.error("Error resetting password:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
