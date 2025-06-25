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

      const stocks = Array.isArray(stock) ? stock : [stock];
      const results = [];
      for (const s of stocks) {
        try {
          let stockDoc = await Stock.findOne({ stock: s.toUpperCase() });
          if (!stockDoc) {
            const price = await getStockPrice(stock);
            stockDoc = new Stock({ stock, likes: 0, ips: [anonymizedIP] });
          } 
          if(like === 'true' && !stockDoc.ips.includes(anonymizedIP)) {
            stockDoc.likes++;
            stockDoc.ips.push(anonymizedIP);
            await stockDoc.save();
          }
          const price = await getStockPrice(s);
          
          results.push({
            stock: s,
            price: price,
            likes: stockDoc.likes
          });
        } catch (error) {
          return res.json({ error: error.message });
        }
      }

      if (results.length === 1) {
        return res.json({ stockData: results[0]});
      } else {
        return res.json({ stockData: results });
      }
  });
    
};
