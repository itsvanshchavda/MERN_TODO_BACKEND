import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(process.env.DB_URI, {
      dbName: "MERN_TODO",
    })
    .then(() => console.log("MongoDB Connected"))
    .catch((e) => console.log("Error in connecting", e));
};
