'use strict';
const express        = require('express');
const router         = express.Router();

const _              = require('lodash');
const Stock          = require('./controller');

router.get('/resources/stock/:ticker', (req, res) => {
  Stock.findByTicker(req.params.ticker)
    .then((stock) => {
      res.status(200).json(stock);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

router.get('/resources/stock/:ticker/summary', (req, res) => {
  Stock.getSummary(req.params.ticker)
    .then((summary) => {
      res.json(summary);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

router.get('/resources/stock/:ticker/historical-prices', (req, res) => {
  const ticker = req.params.ticker;

  Stock.getHistoricals(ticker)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

module.exports = router;
