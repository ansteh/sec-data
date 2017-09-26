const fs        = require('fs');
const _         = require('lodash');
const Promise   = require('bluebird');

const Stock = require('./lib/stock');

const SDLP = {
  "ticker": "SDLP",
  "name": "Seadrill Partners LLC",
  "cik": "0001553467",
  "forms": {
    "annual": "20-F",
    "quarterly": "6-K"
  },
  "filings": {}
};

// Stock.crawlStock(SDLP);

// Stock.crawlQuarterlyFilings('SDLP')
//   .then(console.log)
//   .catch(console.log);

// Stock.downloadQuarterlyFiles('SDLP')
//   .then(console.log)
//   .catch(console.log);

// Stock.parseFilingFilesByTicker('SDLP', '10-Q')
//   .then(console.log)
//   .catch(console.log);

// Stock.find('SDLP', 'Dividends')
//   .then(console.log)
//   .catch(console.log);

// Stock.find('SDLP', 'EarningsPerShareBasic')
//   .then(console.log)
//   .catch(console.log);

// Stock.find('SDLP', 'EarningsPerShareDiluted', '10-K')
//   .then(console.log)
//   .catch(console.log);

// Stock.find('SDLP', 'CurrentFiscalYearEndDate', '10-Q')
//   .then(console.log)
//   .catch(console.log);

// Stock.find('SDLP', 'DocumentPeriodEndDate', '10-Q')
//   .then(console.log)
//   .catch(console.log);

// Stock.crawlStocks('12-09-2017.json')
//   .then(console.log)
//   .catch(console.log);

// const Issues = require('./lib/issues');

// Issues.getStocksOf('12-09-2017.json')
//   .then((stocks) => {
//     const forms = _.map(stocks, (stock) => {
//       return Stock.parseForms(stock.sec.ticker);
//     });
//
//     return Promise.all(forms);
//   })
//   .catch(console.log);

// Stock.find('SDLP', 'Dividends', '20-F')
//   .then(console.log)
//   .catch(console.log);

// Stock.find('BBBY', 'EarningsPerShareDiluted')
//   .then(console.log)
//   .catch(console.log);

// Stock.find('BBBY', 'EarningsPerShareBasic')
//   .then(console.log)
//   .catch(console.log);

// Stock.find('BBBY', 'EarningsPerShareDiluted', '10-K')
//   .then(PeriodReducer.filterAnnualPeriods)
//   .then(console.log)
//   .catch(console.log);

// Stock.find('BBBY', 'EarningsPerShareDiluted', '10-Q')
//   .then(PeriodReducer.filterQuartelyPeriods)
//   .then(metrics => metrics.length)
//   .then(console.log)
//   .catch(console.log);

const PeriodReducer = require('./lib/stock/reducers/period.reducer');

Stock.getMetrics('BBBY', 'EarningsPerShareDiluted', PeriodReducer.filterQuartelyPeriods)
  // .then(metrics => metrics.length)
  .then(console.log)
  .catch(console.log);
