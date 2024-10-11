const mongoose = require('mongoose');

const cryptoSchema = new mongoose.Schema({
    coinId: { type: String, required: true },
    price: { type: Number, required: true },
    marketCap: { type: Number, required: true },
    change24h: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now } // Optional: to track when the data was stored
});

const Crypto = mongoose.model('Crypto', cryptoSchema);

module.exports = Crypto;
