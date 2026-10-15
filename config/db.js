const mongoose = require('mongoose');

// Serverless (Vercel) me connection ko cache karna zaroori hai
let cached = global._mongooseCache;
if (!cached) cached = global._mongooseCache = { conn: null, promise: null };

module.exports = async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, { bufferCommands: false })
      .then((m) => m);
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
};
