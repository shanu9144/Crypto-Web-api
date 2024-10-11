require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cryptoRoutes = require('./routes/cryptoRoutes');
const { fetchCryptoData } = require('./services/cron');

const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api', cryptoRoutes);

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app; 
