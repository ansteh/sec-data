const _       = require('lodash');
const fs      = require('fs-extra');
const util    = require('../util.js');
const Promise = require('bluebird');

const StockService = require('../stock/service');
const Stock        = require('../stock');
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

const getTickerAsStockCandidates = () => {
  return getUnexplored()
    .then((tickers) => {
      return _.filter(tickers, (ticker) => {
        return _.has(ticker, 'ticker') &&
               _.has(ticker, 'cik') &&
               _.has(ticker, 'sic') &&
               _.has(ticker, 'forms');
      });
    })
};

const findTickerAsStockCandidate = () => {
  return getUnexplored()
    .then((tickers) => {
      return _.find(tickers, (ticker) => {
        return _.has(ticker, 'ticker') &&
               _.has(ticker, 'cik') &&
               _.has(ticker, 'sic') &&
               _.has(ticker, 'forms');
      });
    });
}

const getCompanyInfos = (cik) => {
  const searchUrl = Filings.Queries.getCompany({ cik, type: '', count: 100 });

  return Filings.Crawler.crawl(searchUrl)
    .then(Filings.Crawler.parseDocument)
    .then(({ name, sic, columns, entries }) => {
      return {
        name,
        sic,
        forms: getFormTypes(entries)
      };
    });
};

const getFormTypes = (entries) => {
  const types = _
    .chain(entries)
    .map('type')
    .uniq()
    .value();

  if(_.includes(types, '10-K') || _.includes(types, '10-Q')) {
    return  {
      annual: '10-K',
      quarterly: '10-Q'
    };
  }

  if(_.includes(types, '20-F')) {
    return  {
      annual: '20-F',
      quarterly: '6-K'
    };
  }
};

const getAndSaveCompanyInfos = (cik) => {
  return getCompanyInfos(cik)
    .then((infos) => {
      return getAll()
        .then((tickers) => {
          let targets = findAllTickersByCIK(tickers, cik);

          targets.forEach((ticker) => {
            ticker = Object.assign(ticker, infos);
            tickers[ticker.ticker] = ticker;
          });

          return tickers;
        });
    })
    .then((tickers) => {
      return util.writeFile(SOURCE, JSON.stringify(tickers));
    });
};

const findTickerByCIK = (stocks, cik) => {
  const tickers = _.values(stocks);
  return _.find(tickers, { cik })
};

const findAllTickersByCIK = (stocks, cik) => {
  const tickers = _.values(stocks);
  return _.filter(tickers, { cik })
};

const findTickerWithoutSic = () => {
  return getAll()
    .then((tickers) => {
      return _.find(tickers, (ticker) => {
        return ticker.cik &&
               _.has(ticker, 'sic') === false &&
               _.includes(ticker.ticker, ':') === false;
      });
    });
};

const findAndFillCompanyInfos = (delay = 3000) => {
  return findTickerWithoutSic()
    .then((ticker) => {
      if(ticker) {
        console.log(`get infos for ${ticker.ticker}!`);
        setTimeout(() => {
          getAndSaveCompanyInfos(ticker.cik)
            .then(() => {
              console.log(`saved infos for ${ticker.ticker}!`);
              findAndFillCompanyInfos(delay);
            })
            .catch(console.log);
        }, delay);
      }
    })
};

const findAndCreateStocks = (delay = 3000) => {
  return findTickerAsStockCandidate()
    .then((ticker) => {
      if(ticker) {
        console.log(`candidate: ${ticker.ticker}`);
        setTimeout(() => {
          StockService.create(ticker)
            .then(() => {
              console.log(`stock ${ticker.ticker} created.`);
            })
            .then(() => {
              return Stock.crawlAndDownload(ticker.ticker);
            })
            .then(() => {
              findAndCreateStocks(delay);
            })
            .catch(console.log);
        }, delay);
      }
    })
};

const merge = () => {
  const resource = require(`${__dirname}/../../resources/tickers/stocks-new.json`);
  const stocks = require(SOURCE);

  _.forOwn(resource, (stock, ticker) => {
    if((ticker.indexOf('&') === -1) && _.isUndefined(stocks[ticker])) {
      stocks[ticker] = stock;
    }
  });

  // console.log(_.keys(stocks).length);

  return util.writeFile(SOURCE, JSON.stringify(stocks));
};

module.exports = {
  findAndFillCompanyInfos,
  findAndCreateStocks,
  findTickerAsStockCandidate,
  getAndSaveCompanyInfos,
  getAll,
  getCompanyInfos,
  getTickerAsStockCandidates,
  getUnexplored,
  merge,
};
