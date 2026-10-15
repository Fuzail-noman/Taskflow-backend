const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    color: { type: String, default: '#3347E0' },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Project || mongoose.model('Project', projectSchema);
