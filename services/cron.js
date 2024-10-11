require('dotenv').config();
const fetch = require('node-fetch');
const Crypto = require('../models/cryptoModel');
const cron = require('node-cron');


const fetchCryptoData = async () => {
    const coins = ['bitcoin', 'matic-network', 'ethereum'];
    const url = 'https://api.coingecko.com/api/v3/simple/price';

    try {
        // Build the query string directly in the URL
        const response = await fetch(`${url}?ids=${coins.join(',')}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'x-cg-demo-api-key': process.env.CG_API_KEY // Your API key
            }
        });

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Validate and store data for each coin
        for (const coin of coins) {
            // Ensure the data for the coin is present
            if (data[coin]) {
                const coinData = {
                    coinId: coin,
                    price: data[coin].usd,
                    marketCap: data[coin].usd_market_cap,
                    change24h: data[coin].usd_24h_change
                };

                // Store the coin data in the database
                await Crypto.create(coinData);
            } else {
                console.warn(`No data found for ${coin}:`, data[coin]);
            }
        }

        console.log('Cryptocurrency data stored successfully');
    } catch (error) {
        // Log the error message for debugging
        console.error('Error fetching crypto data:', error.message);
    }
};

// Schedule the job to run every 2 hours
if (process.env.NODE_ENV !== 'test') {
    cron.schedule('0 */2 * * *', fetchCryptoData);
}

module.exports = { fetchCryptoData };
