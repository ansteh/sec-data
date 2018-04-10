const _       = require('lodash');
const fs      = require('fs-extra');
const util    = require('../../util.js');
const Promise = require('bluebird');

const StockService = require('../../stock/service');
const Stock        = require('../../stock');
const BASE_PATH = `${__dirname}/../../../resources/industries`;
const STOCKS_PATH = `${BASE_PATH}/stocks`;

const { getListing } = require('../index.js');
const { getCompanyInfos } = require('../../tickers');

const ensureDirectory = (pathname) => {
  return fs.pathExists(pathname)
    .then((exists) => {
      if(exists === false) {
        return fs.ensureDir(pathname);
      }
    });
};

const getStocks = (sic) => {
  const filepath = `${STOCKS_PATH}/${sic}.json`;
  return fs.readJson(filepath)
    .catch(() => { return {}; });
};

const saveStocks = (sic, stocks) => {
  const filepath = `${STOCKS_PATH}/${sic}.json`;
  return ensureDirectory(STOCKS_PATH)
    .then(() => {
      return getStocks(sic);
    })
    .then((currentStocks) => {
      return fs.writeJson(`${STOCKS_PATH}/${sic}.json`, _.assign(currentStocks, stocks));
    });
};

const createStocks = (sic) => {
  return getListing(sic)
    .then((listing) => {
      return _
        .chain(listing)
        .forOwn(stock => stock.sic = sic)
        .keyBy('cik')
        .value();
    })
    .then(stocks => saveStocks(sic, stocks))
};

const getUnexploredStock = (sic) => {
  return getStocks(sic)
    .then((stocks) => {
      return _.find(stocks, stock => _.has(stock, 'forms') === false)
    })
    .then((stock) => {
      if(_.has(stock, 'cik')) {
        return getCompanyInfos(stock.cik)
          .then((info) => {
            stock.forms = _.get(info, 'forms');
            return stock;
          })
      }
    })
};

module.exports = {
  createStocks,
  getUnexploredStock,
};
