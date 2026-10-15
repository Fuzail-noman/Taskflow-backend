const router = require('express').Router();
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

router.use(auth);

async function withCounts(projects) {
  const ids = projects.map((p) => p._id);
  const rows = await Task.aggregate([
    { $match: { project: { $in: ids } } },
    { $group: { _id: { project: '$project', status: '$status' }, n: { $sum: 1 } } },
  ]);
  const map = {};
  rows.forEach((r) => {
    const k = String(r._id.project);
    map[k] = map[k] || { total: 0, done: 0 };
    map[k].total += r.n;
    if (r._id.status === 'done') map[k].done += r.n;
  });
  return projects.map((p) => ({ ...p.toObject(), counts: map[String(p._id)] || { total: 0, done: 0 } }));
}

router.get('/', async (req, res) => {
  const projects = await Project.find({ owner: req.userId }).sort({ createdAt: -1 });
  res.json(await withCounts(projects));
});

router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Project not found' });
  const project = await Project.findOne({ _id: req.params.id, owner: req.userId });
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json((await withCounts([project]))[0]);
});

router.post('/', async (req, res) => {
  const { name, description, color, dueDate } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ message: 'Project name is required' });
  const project = await Project.create({
    owner: req.userId, name, description, color, dueDate: dueDate || null,
  });
  res.status(201).json({ ...project.toObject(), counts: { total: 0, done: 0 } });
});

router.put('/:id', async (req, res) => {
  const { name, description, color, dueDate } = req.body || {};
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    { name, description, color, dueDate: dueDate || null },
    { new: true, runValidators: true }
  );
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json((await withCounts([project]))[0]);
});

router.delete('/:id', async (req, res) => {
  const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!project) return res.status(404).json({ message: 'Project not found' });
  await Task.deleteMany({ project: project._id });
  res.json({ message: 'Project deleted' });
});

module.exports = router;
