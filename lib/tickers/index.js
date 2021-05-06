const _       = require('lodash');
const util    = require('../util.js');

const Stock        = require('../stock');
const Filings      = require('../filings');
const Miners       = require('./miners');

const { getSecTicker } = require('./formats');

const {
  getAll,
  getExistingTickers,
  insertTickers,
  mergeTickers,
  saveTickers,
} = require('./local-storage');

const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const getUnexplored = async () => {
  const [
    candidates,
    tickers,
  ] = await Promise.all([
    getAll(),
    getExistingTickers(),
  ]);
  
  return _.filter(_.values(candidates), (candidate) => {
    return _.includes(tickers, candidate.ticker) === false;
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
    
    return saveTickers(tickers);
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
  await Stock.create(ticker);
  console.log(`stock ${ticker.ticker} created.`);
  await Stock.crawlAndDownload(ticker.ticker);
  
  await delay(delayInMs);

  return findAndCreateStocks(delayInMs);
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
  
  return saveTickers(stocks);
};

const mineAndInsertCompanies = async () => {
  const stocks = await Miners.getStocks();
  const tickers = _.keyBy(stocks, 'ticker');
  
  return insertTickers(tickers);
};

module.exports = {
  findAndFillCompanyInfos,
  findAndFillCompanyInfosByTicker,
  findAndCreateStocks,
  findTickerAsStockCandidate,
  getAndSaveCompanyInfos,
  getAll,
  getCompanyInfos,
  getTickerAsStockCandidates,
  getUnexplored,
  merge: mergeTickers,
  mineAndInsertCompanies,
};
