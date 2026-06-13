const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blood-donor-db';

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    if (process.env.NODE_ENV === 'development') {
      console.warn('Continuing without DB in development mode. Some features will be disabled.');
      return null;
    }
    process.exit(1);
  }
};

module.exports = connectDB;
