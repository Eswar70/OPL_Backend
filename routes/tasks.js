const express = require("express");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const task = new Task({ ...req.body, createdBy: req.user.userId, lastUpdatedBy: req.user.userId });
  await task.save();
  res.status(201).json(task);
});

router.get("/", authMiddleware, async (req, res) => {
  const tasks = await Task.find({ createdBy: req.user.userId });
  res.json(tasks);
});

router.get("/search", authMiddleware, async (req, res) => {
  const { title } = req.query;
  const tasks = await Task.find({ title: new RegExp(title, "i"), createdBy: req.user.userId });
  res.json(tasks);
});

router.put("/:id", authMiddleware, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task || task.createdBy.toString() !== req.user.userId) return res.status(403).json({ message: "Unauthorized" });
  Object.assign(task, req.body, { lastUpdatedBy: req.user.userId, lastUpdatedOn: Date.now() });
  await task.save();
  res.json(task);
});

router.delete("/:id", authMiddleware, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task || task.createdBy.toString() !== req.user.userId) return res.status(403).json({ message: "Unauthorized" });
  await task.deleteOne();
  res.json({ message: "Task deleted" });
});

module.exports = router;