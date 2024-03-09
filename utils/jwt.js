import jwt from "jsonwebtoken";

export const setCookie = (req, res, user, message = "Cookie set successfully", status = 200) => {
  const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY  , {expiresIn: "1h"});

  res
    .cookie("token", token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "development" ? false : true,
      maxAge: 30 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
    })
    .status(status)
    .json({
      success: true,
      message: message,
    });
};
