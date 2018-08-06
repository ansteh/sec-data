'use strict';
const express        = require('express');
const router         = express.Router();

const _              = require('lodash');
const Stocks         = require('./controller');

const Util           = require('../../../lib/util.js');

router.get('/resources/stocks', (req, res) => {
  Stocks.getResourcesByTicker()
    .then((stocks) => {
      res.json(stocks);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

router.get('/share-market/:date', (req, res) => {
  Stocks.filter({ date: req.params.date })
    .then((candidates) => {
      res.json(candidates);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

router.get('/share-market/portfolio/:date', (req, res) => {
  // let tickers;
  //
  // try {
  //   tickers = require('../../../lib/account/importers/degiro/resources/tickers.json');
  // } catch(err) {
  //   console.log(err);
  //   tickers = [];
  // }

  Util.loadFileContent(`${__dirname}/../../../lib/account/importers/degiro/resources/tickers.json`)
    .then(JSON.parse)
    .catch((err) => {
      return [];
    })
    .then((tickers) => {
      return Stocks.filter({ date: req.params.date, tickers });
    })
    .then((candidates) => {
      res.json(candidates);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

module.exports = router;
