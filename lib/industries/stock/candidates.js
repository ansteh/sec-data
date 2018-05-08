const _       = require('lodash');
const fs      = require('fs-extra');
const util    = require('../../util.js');
const Promise = require('bluebird');

const StockService = require('../../stock/service');
const Stock        = require('../../stock');
const Industries = require('../index.js');

const BASE_PATH = `${__dirname}/../../../resources/industries`;
const CANDIDATES_PATH = `${BASE_PATH}/candidates.json`;

const getCandidates = () => {
  return fs.readJson(CANDIDATES_PATH)
    .catch((entries) => { return {}; });
};

const saveCandidates = (stocks) => {
  return getCandidates()
    .then((currentStocks) => {
      return _.merge({}, currentStocks, stocks);
    })
    .then((stocks) => {
      return fs.writeJson(CANDIDATES_PATH, stocks);
    })
};

const createCandidates = (minEntries = 8) => {
  return Industries.filterInteractiveNotRegisteredStocks(minEntries)
    .then((stocks) => {
      return _.keyBy(stocks, 'cik');
    })
    .then(saveCandidates)
};

const findCandidateWithoutTicker = () => {
  return getCandidates()
    .then(_.values)
    .then((stocks) => {
      return _.find(stocks, (stock) => {
        return _.has(stock, 'ticker') === false;
      })
    })
};

const updateStock = (stock) => {
  if(_.has(stock, 'cik') === false) {
    return Promise.reject('MISSING_CIK');
  }

  return getCandidates()
    .then(_.values)
    .then((stocks) => {
      return _.find(stocks, { cik: stock.cik })
    })
    .then((origin) => {
      if(origin) {
        const stocks = {};
        stocks[stock.cik] = _.assign({}, origin, stock);

        return saveCandidates(stocks);
      }
    })
};

module.exports = {
  createCandidates,
  getCandidates,
  findCandidateWithoutTicker,
  saveCandidates,
  updateStock,
};
