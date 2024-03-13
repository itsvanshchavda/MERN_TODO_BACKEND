// import crypto from "crypto";

// export const createResetToken = async () => {
//   const resetToken = crypto.randomBytes(20).toString("hex");
//   const passwordResetToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");

//   const passwordResetExpire = Date.now() + 10 * 60 * 1000;

//   const otp = Math.floor(100000 + Math.random() * 900000); 


//   console.log(resetToken, passwordResetToken, passwordResetExpire , otp);

//   return { passwordResetToken, passwordResetExpire, resetToken  , otp};
// };
