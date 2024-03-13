import { User } from "../model/user.js";
import bcrypt from "bcrypt";
import { setCookie } from "../utils/jwt.js";
import { sendEmail } from "../utils/email.js";

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
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    user.otp = otp;

    await user.save();

    // Send email
    const message = "Rest password request received";
    const htmlMessage = `<div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
    <h1 style="color: #333333;">One-Time Password (OTP) Email</h1>
    <p style="font-size: 16px;">Hello,</p>
    <p style="font-size: 16px;">Your One-Time Password (OTP) : <strong>${otp}</strong></p>
    <p style="font-size: 16px;">Please use this OTP to proceed with your action.</p>
    <p style="font-size: 16px;">Thank you.</p>
</div>`;
    await sendEmail({
      email: user.email,
      subject: "Password Change Reset",
      message,
      html: htmlMessage,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email!",
      otp,
    });
  } catch (err) {
    console.error("Error sending OTP:", err.message);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// resetPassword
export const resetPassword = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    const user = await User.findOne({ otp });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const newPassword = req.body.password;
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error("Error resetting password:", err.message);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
