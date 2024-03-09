import { Router } from "express";
import {
  addtask,
  deleteTask,
  getTask,
  updateTask,
} from "../controller/task.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = Router();

router.post("/addtask", isAuthenticated, addtask);

router.get("/mytask", isAuthenticated, getTask);

router.route("/:id").put(updateTask).delete(deleteTask);

export default router;
