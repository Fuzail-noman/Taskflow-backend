require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Frontend ka link backend me nahi hai: sab origins allowed
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => res.json({ name: 'TaskFlow API', status: 'ok' }));

// Har request se pehle DB connect (cached)
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (e) {
    next(e);
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/stats', require('./routes/stats'));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id' });
  res.status(500).json({ message: err.message || 'Server error' });
});

if (!process.env.VERCEL) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`API running on http://localhost:${port}`));
}

module.exports = app;
