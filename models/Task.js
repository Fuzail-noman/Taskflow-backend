const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    status: { type: String, enum: ['todo', 'inprogress', 'review', 'done'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Task || mongoose.model('Task', taskSchema);
