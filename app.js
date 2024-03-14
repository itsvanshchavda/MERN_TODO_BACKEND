import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./data/data.js";
import userRouter from "./routes/userRoutes.js";
import taskRouter from "./routes/taskRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";


dotenv.config({
  path: "./data/config.env",
});

export const app = express();

// CORS
const corsOptions = {
  origin: ["http://localhost:5173" , "https://mern-todo-vansh.vercel.app/"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Routes
app.use("/api/v2/users", userRouter);
app.use("/api/v2/tasks", taskRouter);

// Default route
app.get("/", (req, res) => {
  res.send("Hello Todo Backend!");
});

// Error handling
