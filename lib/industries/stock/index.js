const _       = require('lodash');
const fs      = require('fs-extra');
const util    = require('../../util.js');
const Promise = require('bluebird');

const StockService = require('../../stock/service');
const Stock        = require('../../stock');
const BASE_PATH = `${__dirname}/../../../resources/industries`;
const STOCKS_PATH = `${BASE_PATH}/stocks`;

const { getCompanyInfos } = require('../../tickers');

const getListing = (sic) => {
  return fs.readJson(`${__dirname}/../../../resources/industries/listings/${sic}.json`);
};

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

const saveStockBySIC = (sic, stock, stocks) => {
  const cik = _.get(stock, 'cik');
  stocks[cik] = stock;

  return fs.writeJson(`${STOCKS_PATH}/${sic}.json`, stocks);
};

const crawlUnexploredStock = (sic) => {
  return getStocks(sic)
    .then((stocks) => {
      const stock = _.find(stocks, stock => _.has(stock, 'forms') === false);

      if(_.has(stock, 'cik')) {
        console.log(`Crawl filings of ${_.get(stock, 'name')}!`);

        return getCompanyInfos(stock.cik)
          .then((info) => {
            stock.forms = _.get(info, 'forms');

            if(stock.forms) {
              return Stock.crawlFilingsByStock(stock);
            }

            return stock;
          })
          .then((stock) => {
            if(_.isUndefined(stock.forms)){
              console.log(`No forms available for ${_.get(stock, 'name')}!`);
              stock.forms = 'N/A';
            }

            return saveStockBySIC(sic, stock, stocks)
          })
          .then(() => {
            return crawlUnexploredStock(sic);
          })
      }
    })
};

const getStats = (sic) => {
  return getStocks(sic)
    .then(_.values)
    .then((stocks) => {
      const [active, inactive] = _.partition(stocks, (stock) => {
        return stock.forms !== 'N/A'
      });

      return {
        count: stocks.length,
        active: active.length,
        inactive: inactive.length,
      };
    })
};

const filterInteractiveStocks = (sic, minEntries = 0) => {
  return getStocks(sic)
    .then(_.values)
    .then((stocks) => {
      return _
        .chain(stocks)
        .filter((stock) => {
          return stock.forms !== 'N/A'
        })
        .filter((stock) => {
          const formType = _.get(stock, 'forms.annual');
          const entries = StockService.filterInteractiveAnnualFilings(stock, formType);

          return entries.length > minEntries;
        })
        .value();
    })
};

module.exports = {
  createStocks,
  crawlUnexploredStock,
  getStats,
  filterInteractiveStocks,
};
