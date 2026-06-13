const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');
const teamRoutes = require('./routes/team.routes');
dotenv.config();

const app = express();
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Seed a default admin only on first run — never overwrite credentials set via the settings page
const seedAdminUser = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) return; // admin already exists; skip seed

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

    const admin = new Admin({ username: adminUsername, password: adminPassword });
    await admin.save();
    console.log(`Default admin created: ${adminUsername}`);
  } catch (error) {
    console.error('Error seeding admin user:', error.message || error);
  }
};

// Middleware
// FRONTEND_URL may be a single origin or a comma-separated list of allowed origins.
// Vercel preview deployments (https://*.vercel.app) are allowed automatically.
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow non-browser requests (curl, server-to-server) with no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (/\.vercel\.app$/.test(new URL(origin).hostname)) return callback(null, true);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/public', require('./routes/public'));
app.use('/api/admin', require('./routes/admin'));
app.use("/api", teamRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Blood Donor API Server' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const startServer = async () => {
  await connectDB();
  await seedAdminUser();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
