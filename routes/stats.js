const router = require('express').Router();
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  const owner = new mongoose.Types.ObjectId(req.userId);
  const now = new Date();

  const [projects, statusRows, priorityRows, overdue, upcoming] = await Promise.all([
    Project.countDocuments({ owner }),
    Task.aggregate([{ $match: { owner } }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
    Task.aggregate([
      { $match: { owner, status: { $ne: 'done' } } },
      { $group: { _id: '$priority', n: { $sum: 1 } } },
    ]),
    Task.countDocuments({ owner, status: { $ne: 'done' }, dueDate: { $lt: now, $ne: null } }),
    Task.find({ owner, status: { $ne: 'done' }, dueDate: { $ne: null } })
      .sort({ dueDate: 1 })
      .limit(6)
      .populate('project', 'name color'),
  ]);

  const byStatus = { todo: 0, inprogress: 0, review: 0, done: 0 };
  statusRows.forEach((r) => (byStatus[r._id] = r.n));
  const byPriority = { low: 0, medium: 0, high: 0 };
  priorityRows.forEach((r) => (byPriority[r._id] = r.n));
  const tasks = Object.values(byStatus).reduce((a, b) => a + b, 0);

  res.json({
    totals: { projects, tasks, done: byStatus.done, overdue },
    byStatus,
    byPriority,
    upcoming,
  });
});

module.exports = router;
