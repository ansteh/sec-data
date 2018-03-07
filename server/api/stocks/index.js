'use strict';
const express        = require('express');
const router         = express.Router();

const _              = require('lodash');
const Stocks         = require('./controller');

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

module.exports = router;
