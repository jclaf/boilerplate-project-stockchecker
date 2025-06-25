'use strict';

const mongoose = require('mongoose');
const crypto = require('crypto');
const axios = require('axios');


module.exports = function (app) {
  
    // Define stock schema and model
  const stockSchema = new mongoose.Schema({
    stock: { type: String, required: true },
    likes: { type: Number, default: 0 },
    ips: [String] // Store anonymized IPs
  });
  
  const Stock = mongoose.model('Stock', stockSchema);

  function anonymizeIP(ip) {
    return crypto.createHash('sha256').update(ip + 'secret-salt').digest('hex');
  }

  async function getStockPrice(symbol) {
    try {
      const response = await axios.get(
        `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`
      );
      return response.data.latestPrice;
    } catch (error) {
      throw new Error('Unable to fetch stock price');
    }
  }

  app.route('/api/stock-prices')
    .get(async function (req, res){
      let { stock, like } = req.query;
      const clientIP = req.ip || req.connection.remoteAddress;
      const anonymizedIP = anonymizeIP(clientIP);
      if (!stock) {
        return res.json({ error: 'Stock parameter required' });
      }
      stock = stock.toUpperCase();
      try {
        let stockData = await Stock.findOne({ stock });
        if (!stockData) {
          const price = await getStockPrice(stock);
          stockData = new Stock({ stock, likes: 0, ips: [anonymizedIP] });
          await stockData.save();
        } else {
          stockData.ips.push(anonymizedIP);
          await stockData.save();
        }
        if (like) {
          stockData.likes++;
          await stockData.save();
        }
        
        const price = await getStockPrice(stock);
        const response = {
          stock: stockData.stock,
          price: price,
          likes: stockData.likes
        };
        return res.json(response);
      } catch (error) {
        return res.json({ error: error.message });
      }

    });
    
};
