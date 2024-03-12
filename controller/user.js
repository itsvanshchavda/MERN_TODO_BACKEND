import { User } from "../model/user.js";
import bcrypt from "bcrypt";
import { setCookie } from "../utils/jwt.js";
import { getGoogleProfile } from "../utils/googleAuth.js";

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
    res.status(500).json({ success: false, message: err.message });
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
    res.status(500).json({ success: false, message: err.message });
  }
};

// export const googleLogin = async (req, res) => {
//   try {
//     const { id, token } = req.body;

//     const profile = await getGoogleProfile(token);
//     console.log(profile);

//     const email = profile.email;
//     const name = profile.name;
//     const picture = profile.picture;

//     let user = await User.findOne({ email });

//     if (!user) {
//       user = await User.create({
//         name,
//         email,
//         picture,
//         password: "",
//         googleId: id,
//       });
//     }

//     setCookie(req, res, user, `Welcome Back! ${user.name}`, 200);
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

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
    res.status(500).json({
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
