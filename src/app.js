const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');

dotenv.config();

const cors = require('cors');

// Allow your GitHub Pages origin explicitly
const corsOptions = {
    origin: 'https://mvpvovo.github.io', // Your exact frontend origin (no trailing slash)
    optionsSuccessStatus: 200 // some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/members', require('./routes/members'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/events', require('./routes/events'));
app.use('/api/alcohol', require('./routes/alcohol'));
app.use('/api/reports', require('./routes/reports'));

const PORT = process.env.PORT || 25397;

sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
