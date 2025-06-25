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
      try {
        console.log('All query params:', req.query);
        let { stock, like } = req.query;
        console.log('Like parameter:', like, typeof like);
        const clientIP = req.ip || req.connection.remoteAddress;
        const anonymizedIP = anonymizeIP(clientIP);
        if (!stock) {
          return res.json({ error: 'Stock parameter required' });
        }

        const stocks = Array.isArray(stock) ? stock : [stock];
        const results = [];
        for (const s of stocks) {
            let stockDoc = await Stock.findOne({ stock: s.toUpperCase() });
            if (!stockDoc) {
              //const price = await getStockPrice(stock);
              stockDoc = new Stock({ stock: s.toUpperCase(), likes: 0, ips: [] });
            } 
            if((like === 'true'|| like===true )&& !stockDoc.ips.includes(anonymizedIP)) {
              stockDoc.likes++;
              stockDoc.ips.push(anonymizedIP);
              //await stockDoc.save();
            }
            await stockDoc.save();
            const price = await getStockPrice(s);
            
            console.log('Like parameter:', like, typeof like);
            console.log('Stock found:', stockDoc ? 'yes' : 'no');
            console.log('IP already liked:', stockDoc ? stockDoc.ips.includes(anonymizedIP) : 'N/A');
            
            results.push({
              stock: s.toUpperCase(),
              price: price,
              likes: stockDoc.likes
            });
            
        }

        if (results.length === 1) {
          return res.json({ stockData: results[0]});
        } else{
          // Two stocks: calculate relative likes and return array
          const [stock1, stock2] = results;
          stock1.rel_likes = stock1.likes - stock2.likes;
          stock2.rel_likes = stock2.likes - stock1.likes;
          
          // Remove likes property for two-stock response
          delete stock1.likes;
          delete stock2.likes;
          return res.json({ stockData: [stock1, stock2] });
        }

      } catch (error) {
        return res.json({ error: error.message });
      }
  });
    
};
