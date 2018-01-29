'use strict';
const _ = require('lodash');

const express        = require('express');
const app            = express();
const path           = require('path');
const bodyParser     = require('body-parser');
const cors           = require('cors');

app.use(cors());
app.use(bodyParser.json());

const StockService  = require('./lib/stock/service');
const Stock         = require('./lib/stock');
const Summarizer    = require('./lib/stock/summary');
const PricesService = require('./lib/stock/price/service');

const ShareMarket   = require('./lib/share-market/');
const MarketModels  = require('./lib/share-market/model');
const Filters       = require('./lib/share-market/filters.js');

const Promise = require('bluebird');

const cache = {};

const getShareMarket = () => {
  if(_.has(cache, 'ShareMarket')) {
    return Promise.resolve(_.get(cache, 'ShareMarket'));
  } else {
    return ShareMarket.getMarket()
      .then((market) => {
        const scopes = [{
          buildTime: 'aot',
          path: 'annual.DerivedDCF_IntrinsicValue_MAX_GROWTH_RATE_20_BY_MEAN',
          aggregate: 'getAllMetricMarginByPrice',
        }];

        return MarketModels.createShareMarketTimeline({ market, scopes });
      })
      .then((market) => {
        _.set(cache, 'ShareMarket', market);
        return market;
      });
  }
};

const getStocksFromResources = () => {
  if(_.has(cache, 'StocksFromResources')) {
    return Promise.resolve(_.get(cache, 'StocksFromResources'));
  } else {
    return StockService.getStocksFromResources()
      .then((resources) => {
        _.set(cache, 'StocksFromResources', resources);
        return resources;
      });
  }
};

app.get('/share-market/:date', (req, res) => {
  getShareMarket()
    .then((marketTimeline) => {
      return marketTimeline.filterBy(Filters.filterCandidatesForBuying, req.params.date);
    })
    .then((candidates) => {
      res.json(candidates);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

app.get('/stock/fundamental-accounting-concepts/:ticker/:formType', (req, res) => {
  Summarizer.getFundamentalsByTicker(req.params.ticker, req.params.formType)
    .then((concepts) => {
      res.json(concepts);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

app.get('/resources/stocks', (req, res) => {
  // StockService.getStocksFromResources()
  getStocksFromResources()
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

app.get('/resources/stock/:ticker/summary', (req, res) => {
  StockService.getSummary(req.params.ticker)
    .then((summary) => {
      res.json(summary);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

app.get('/resources/stock/:ticker/summarize', (req, res) => {
  const ticker = req.params.ticker;

  Summarizer.getAndSaveGaapMetrics(ticker)
    .then(() => {
      return StockService.getSummary(ticker);
    })
    .then((summary) => {
      res.json(summary);
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

app.get('/resources/stock/:ticker/historical-prices', (req, res) => {
  const ticker = req.params.ticker;

  PricesService.get(ticker)
    .then((data) => {
      res.json(data);
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
