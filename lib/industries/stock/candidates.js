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

module.exports = {
  createCandidates,
  getCandidates,
  saveCandidates,
};
