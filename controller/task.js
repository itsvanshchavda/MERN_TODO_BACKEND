import { Task } from "../model/task.js";

//Task controller
export const addtask = async (req, res) => {
  try {
    const { title, description, completed } = req.body;

    const existingTask = await Task.findOne({ title });

    if (existingTask)
      return res.status(400).json({ message: "Task already exists" });

    let task = await Task.create({
      title,
      description,
      completed,
      user: req.user,
    });

    if (!task)
      return res
        .status(400)
        .json({ success: false, message: "Task not created" });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { title, description, completed } = req.body;

    const tasks = await Task.findById(req.params.id);
    if (!tasks) {
      return res.status(404).json({ success: false, message: "No task found" });
    }

    tasks.title = title;
    tasks.description = description;
    tasks.completed = completed;

    await tasks.save();

    res.status(200).json({ success: "Task Updated !!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteTask = await Task.findByIdAndDelete(id);

    if (!deleteTask || deleteTask.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "No task with that id" });

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTask = async (req, res) => {
  try {
    let tasks = await Task.find({ user: req.user });

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No task found",
      });
    }
    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
