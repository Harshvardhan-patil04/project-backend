const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();

// Ensure FRONTEND_URL is set
const frontendURL = process.env.FRONTEND_URL?.trim();
if (!frontendURL) {
  console.error("⚠️ FRONTEND_URL is missing in .env");
}

// CORS setup
const corsOptions = {
  origin: frontendURL || "https://notes-project-frontend-8jrd.onrender.com", 
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
};
app.use(cors(corsOptions));

// Handle preflight requests globally
app.options(/.*/, cors(corsOptions));

// Body parser
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/admin', require('./routes/admin'));

// Default admin creation
const createDefaultAdmin = async () => {
  try {
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      admin = new User({ 
        name: 'Admin', 
        email: adminEmail, 
        password: hashedPassword, 
        role: 'admin'   // <-- set role
      });
      await admin.save();
      console.log('✅ Default admin created');
    } else {
      console.log('ℹ️ Admin already exists');
    }
  } catch (err) {
    console.error('Error creating admin:', err.message);
  }
};

// Connect DB and create admin
connectDB()
  .then(() => {
    console.log('MongoDB connected');
    createDefaultAdmin();
  })
  .catch(err => {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
