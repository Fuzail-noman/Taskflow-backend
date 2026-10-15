const router = require('express').Router();
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  const { project } = req.query;
  if (!project || !mongoose.isValidObjectId(project)) return res.status(400).json({ message: 'Valid project id is required' });
  const tasks = await Task.find({ owner: req.userId, project }).sort({ createdAt: -1 });
  res.json(tasks);
});

router.post('/', async (req, res) => {
  const { project, title, description, status, priority, dueDate } = req.body || {};
  if (!title || !title.trim()) return res.status(400).json({ message: 'Task title is required' });
  if (!mongoose.isValidObjectId(project)) return res.status(400).json({ message: 'Valid project id is required' });
  const owns = await Project.exists({ _id: project, owner: req.userId });
  if (!owns) return res.status(404).json({ message: 'Project not found' });
  const task = await Task.create({
    owner: req.userId, project, title, description, status, priority, dueDate: dueDate || null,
  });
  res.status(201).json(task);
});

router.put('/:id', async (req, res) => {
  const allowed = ['title', 'description', 'status', 'priority', 'dueDate'];
  const update = {};
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) update[k] = k === 'dueDate' ? req.body[k] || null : req.body[k];
  });
  const task = await Task.findOneAndUpdate({ _id: req.params.id, owner: req.userId }, update, {
    new: true, runValidators: true,
  });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

router.delete('/:id', async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json({ message: 'Task deleted' });
});

module.exports = router;
