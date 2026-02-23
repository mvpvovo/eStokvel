const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');

dotenv.config();

const app = express(); // ← missing line

// Middleware
app.use(cors()); // Allow all origins (or configure via env later)
app.use(express.json()); // ← essential for parsing JSON bodies

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/members', require('./routes/members'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/events', require('./routes/events'));
app.use('/api/alcohol', require('./routes/alcohol'));
app.use('/api/reports', require('./routes/reports'));

const PORT = process.env.PORT || 5000; // Use Render's PORT or fallback to 5000 locally

sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, '0.0.0.0', () => { // Bind to 0.0.0.0 for Render
    console.log(`Server running on port ${PORT}`);
  });
});
