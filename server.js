'use strict';

const express        = require('express');
const app            = express();
const path           = require('path');
const bodyParser     = require('body-parser');
const cors           = require('cors');

app.use(cors());
app.use(bodyParser.json());

const StockService = require('./lib/stock/service');
const Stock        = require('./lib/stock');

app.get('/resources/stocks', (req, res) => {
  StockService.getStocksFromResources()
    .then((stocks) => {
      res.json(stocks);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

app.get('/resources/stock/:ticker', (req, res) => {
  StockService.findByTicker(req.params.ticker)
    .then((stock) => {
      res.status(200).json(stock);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

app.get('/resources/stock/:ticker/crawl', (req, res) => {
  console.log('crawlAndDownload', req.params.ticker);
  Stock.crawlAndDownload(req.params.ticker)
    .then((success) => {
      return StockService.findByTicker(req.params.ticker);
    })
    .then((stock) => {
      res.json(stock);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

app.get('/resources/stock/:ticker/parse', (req, res) => {
  Stock.parseFilings(req.params.ticker)
    .then((stock) => {
      res.json({});
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

app.post('/stock/create', (req, res) => {
  StockService.create(req.body)
    .then((success) => {
      return StockService.findByTicker(req.body.ticker);
    })
    .then((stock) => {
      res.json(stock);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

const server = require('http').Server(app);

server.listen(3000, function(){
  console.log('listening on *:3000');
});
