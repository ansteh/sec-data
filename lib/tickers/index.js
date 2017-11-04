const _       = require('lodash');
const fs      = require('fs-extra');
const util    = require('../util.js');
const Promise = require('bluebird');

const StockService = require('../stock/service');
const Filings      = require('../filings');

const SOURCE = `${__dirname}/../../resources/tickers/stocks.json`;

const getAll = () => {
  return util.loadFileContent(SOURCE)
    .then(content => JSON.parse(content))
};

const getUnexplored = () => {
  return StockService.getStocksFromResources()
    .then((stocks) => {
      return _.map(stocks, 'ticker');
    })
    .then((tickers) => {
      return getAll()
        .then((candidates) => {
          return _.filter(_.values(candidates), (candidate) => {
            return _.includes(tickers, candidate.ticker) === false;
          });
        })
    });
};

const getFilingTypes = (cik) => {
  const searchUrl = Filings.Queries.getCompany({ cik, type: '', count: 100 });

  return Filings.Crawler.crawl(searchUrl)
    .then(Filings.Crawler.parseDocument)
    .then(({ columns, entries}) => {
      return _
        .chain(entries)
        .map('type')
        .uniq()
        .value();
    })
    .then(getFormTypes);
};

const getFormTypes = (types) => {
  const forms = {};

  if(_.includes(types, '10-K')) {
    forms.annual = '10-K';
  }

  if(_.includes(types, '10-Q')) {
    forms.quarterly = '10-Q';
  }

  return forms;
};

module.exports = {
  getAll,
  getFilingTypes,
  getUnexplored,
};
