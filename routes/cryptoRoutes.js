const express = require('express');
const Crypto = require('../models/cryptoModel');
const router = express.Router();

// Allowed coins for validation
const validCoins = ['bitcoin', 'ethereum', 'matic-network'];

// Route for /stats
router.get('/stats', async (req, res) => {
    const { coin } = req.query;

    // Validate if the 'coin' query parameter is provided
    if (!coin) {
        return res.status(400).json({ message: 'Coin query parameter is required' });
    }

    console.log(`Received coin parameter: ${coin}`); // Debugging line

    // Check if the specified coin is valid
    if (!validCoins.includes(coin)) {
        return res.status(400).json({ message: 'Invalid coin specified' });
    }
    
    console.log(`Valid coins: ${validCoins}`); // Debugging line

    try {
        const latestData = await Crypto.findOne({ coinId: coin }).sort({ timestamp: -1 });

        if (!latestData) {
            return res.status(404).json({ message: 'Data not found for the specified coin' });
        }

        res.json({
            success: true,
            data: {
                price: latestData.price,
                marketCap: latestData.marketCap,
                '24hChange': latestData.change24h
            }
        });
    } catch (error) {
        console.error(`Error fetching data for coin ${coin}:`, error); // Log error details
        res.status(500).json({ error: 'Server Error' });
    }
});

// Route for /deviation
router.get('/deviation', async (req, res) => {
    const { coin } = req.query;

    // Validate if the 'coin' query parameter is provided
    if (!coin) {
        return res.status(400).json({ message: 'Coin query parameter is required' });
    }

    // Check if the specified coin is valid
    if (!validCoins.includes(coin)) {
        return res.status(400).json({ message: 'Invalid coin specified' });
    }

    console.log(`Received coin parameter for deviation: ${coin}`); // Debugging line

    try {
        const priceRecords = await Crypto.find({ coinId: coin })
            .sort({ timestamp: -1 })
            .limit(100)
            .select('price -_id'); // Get only the 'price' field, excluding '_id'

        const prices = priceRecords.map(record => record.price);

        // Check if we have enough data points to calculate deviation
        if (prices.length < 2) {
            return res.status(400).json({ message: 'Not enough data to calculate deviation' });
        }

        // Calculate mean and standard deviation
        const mean = prices.reduce((acc, val) => acc + val, 0) / prices.length;
        const variance = prices.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / prices.length;
        const stdDeviation = Math.sqrt(variance).toFixed(2);

        res.json({
            success: true,
            data: { deviation: stdDeviation }
        });
    } catch (error) {
        console.error(`Error calculating deviation for coin ${coin}:`, error); // Log error details
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
