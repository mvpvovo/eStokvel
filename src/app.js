const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');

dotenv.config();

const app = express();

// ✅ CORS – allow only your frontend (replace with your actual live URL)
app.use(cors({ origin: 'https://mvpvovo.github.io/stokvel-frontend' }));

app.use(express.json());

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
