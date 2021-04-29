const _       = require('lodash');
const fs      = require('fs-extra');
const util    = require('../util.js');
const Promise = require('bluebird');

const StockService = require('../stock/service');
const Stock        = require('../stock');
const Filings      = require('../filings');

const SOURCE = `${__dirname}/../../resources/tickers/stocks.json`;

const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

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
    .then(({ name, sic, cik, columns, entries }) => {
      return {
        name,
        cik,
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

const getAndSaveCompanyInfos = async (cik) => {
  const infos = await getCompanyInfos(cik);
  const tickers = await getAll();
  
  let targets = findAllTickersByCIK(tickers, cik);
  
  if(targets.length > 0) {
    targets.forEach((ticker) => {
      ticker = Object.assign(ticker, infos);
      tickers[ticker.ticker] = ticker;
    });
    
    return util.writeFile(SOURCE, JSON.stringify(tickers));
  }
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

const findAndFillCompanyInfos = async (delayInMs = 3000) => {
  const ticker = await findTickerWithoutSic();
  if(!ticker) return;
  
  console.log(`get infos for ${ticker.ticker}!`);
  await getAndSaveCompanyInfos(ticker.cik);
  console.log(`saved infos for ${ticker.ticker}!`);
  
  await delay(delayInMs);

  return findAndFillCompanyInfos(delayInMs);
};

const findAndCreateStocks = async (delayInMs = 3000) => {
  const ticker = await findTickerAsStockCandidate();
  if(!ticker) return;
  
  console.log(`candidate: ${ticker.ticker}`);
  await StockService.create(ticker);
  console.log(`stock ${ticker.ticker} created.`);
  await Stock.crawlAndDownload(ticker.ticker);
  
  await delay(delayInMs);

  return findAndCreateStocks(delayInMs);
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

const findAndFillCompanyInfosByTicker = async (delayInMs = 3000) => {
  const candidate = await findTickerWithoutCik();
  if(!candidate) return;
  
  await getAndSaveCompanyByTicker(candidate);
  await delay(delayInMs);

  return findAndFillCompanyInfosByTicker(delayInMs);
};

const findTickerWithoutCik = async () => {
  const tickers = await getAll();
  
  return _.find(tickers, (ticker) => {
    return !ticker.cik && ticker.ticker;
  });
};

const getAndSaveCompanyByTicker = async (candidate) => {
  const ticker = getSecTicker(candidate.ticker);
  if(!ticker) return;
  
  const infos = await getCompanyInfos(ticker);
  if(!infos.cik) return;
  
  const stocks = await getAll();
  const stock = Object.assign({}, stocks[candidate.ticker], infos);
  delete stocks[candidate.ticker];
  stocks[ticker] = stock;
  
  return util.writeFile(SOURCE, JSON.stringify(stocks));
};

const getSecTicker = ticker => _.last((ticker || '').trim().split(':'))
  .toUpperCase();

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
