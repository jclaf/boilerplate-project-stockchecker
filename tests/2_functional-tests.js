const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite("Functional Tests", function () {
        // test('DEBUG - simple query', function(done) {
        //     chai.request(server)
        //     .get('/api/stock-prices')
        //     .query('stock=DEBUG&like=true') // ✅ String au lieu d'objet
        //     .end(function(err, res){
        //         console.log('Response:', res.body);
        //         done()
        //     })
        // })
        test('Viewing one stock: GET request to /api/stock-prices/', function(done) {
            chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: 'GOOG' })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.property(res.body, 'stockData');
                assert.property(res.body.stockData, 'stock');
                assert.property(res.body.stockData, 'price');
                assert.property(res.body.stockData, 'likes');
                assert.equal(res.body.stockData.stock, 'GOOG');
                assert.isNumber(res.body.stockData.price);
                assert.isNumber(res.body.stockData.likes);
                done();
            });
        });
        

        test('Viewing one stock and liking it: GET request to /api/stock-prices/', function(done) {
            chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: 'GOOG', like: 'true' })
            
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.property(res.body, 'stockData');
                assert.property(res.body.stockData, 'stock');
                assert.property(res.body.stockData, 'price');
                assert.property(res.body.stockData, 'likes');
                assert.equal(res.body.stockData.stock, 'GOOG');
                assert.isNumber(res.body.stockData.price);
                assert.isNumber(res.body.stockData.likes);
                done();
            });
        });

        test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function(done) {
            chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: 'GOOG', like: 'true' })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.property(res.body, 'stockData');
                assert.property(res.body.stockData, 'stock');
                assert.property(res.body.stockData, 'price');
                assert.property(res.body.stockData, 'likes');
                assert.equal(res.body.stockData.stock, 'GOOG');
                assert.isNumber(res.body.stockData.price);
                assert.isNumber(res.body.stockData.likes,1);
                done();
            });
        });

        test('Viewing two stocks: GET request to /api/stock-prices/', function(done) {
            chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: ['GOOG', 'MSFT'] })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.property(res.body, 'stockData');
                assert.isArray(res.body.stockData);
                
                
                // Vérifier le premier stock
                assert.property(res.body.stockData[0], 'stock');
                assert.property(res.body.stockData[0], 'price');
                assert.property(res.body.stockData[0], 'rel_likes');
                assert.equal(res.body.stockData[0].stock, 'GOOG')
                assert.isNumber(res.body.stockData[0].price)
                assert.isNumber(res.body.stockData[0].rel_likes)
                
                // Vérifier le deuxième stock
                assert.property(res.body.stockData[1], 'stock');
                assert.property(res.body.stockData[1], 'price');
                assert.property(res.body.stockData[1], 'rel_likes');
                assert.equal(res.body.stockData[1].stock, 'MSFT')
                assert.isNumber(res.body.stockData[1].price)
                assert.isNumber(res.body.stockData[1].rel_likes)
               
                done();
            });
        });

        test('Viewing two stocks and liking them: GET request to /api/stock-prices/', function(done) {
            chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: ['GOOG', 'MSFT'], like: 'true' })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.property(res.body, 'stockData');
                assert.isArray(res.body.stockData);
                
                // Vérifier le premier stock
                assert.property(res.body.stockData[0], 'stock');
                assert.property(res.body.stockData[0], 'price');
                assert.property(res.body.stockData[0], 'rel_likes');
                assert.equal(res.body.stockData[0].stock, 'GOOG')
                assert.isNumber(res.body.stockData[0].price)
                assert.isNumber(res.body.stockData[0].rel_likes)
                
                // Vérifier le deuxième stock
                assert.property(res.body.stockData[1], 'stock');
                assert.property(res.body.stockData[1], 'price');
                assert.property(res.body.stockData[1], 'rel_likes');
                assert.equal(res.body.stockData[1].stock, 'MSFT')
                assert.isNumber(res.body.stockData[1].price)
                assert.isNumber(res.body.stockData[1].rel_likes)
                
                done();
            });
        });
});