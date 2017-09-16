const fs        = require('fs');
const _         = require('lodash');

const Stock = require('./lib/stock');

const GM = {
  ticker: 'GM',
  name: 'General Motors Co',
  cik: '0001467858',
  filings: {}
};

const HIBB = {
  ticker: 'HIBB',
  name: 'HIBBETT SPORTING GOODS INC',
  cik: '0001017480',
  filings: {}
};

const KR = {
  ticker: 'KR',
  name: 'The Kroger Co',
  cik: '0000056873',
  filings: {}
};

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

const SORL = {
  "ticker": "SORL",
  "name": "Auto Parts Inc",
  "cik": "0000714284",
  "forms": {
    "annual": "10-K",
    "quarterly": "10-Q"
  },
  "filings": {}
};

// Stock.crawlStock(GM);
// Stock.crawlStock(SORL);

// Stock.parseFilingFilesByTicker('KR')
//   .then(console.log)
//   .catch(console.log);

// Stock.crawlQuarterlyFilings('KR')
//   .then(console.log)
//   .catch(console.log);

// Stock.downloadQuarterlyFiles('KR')
//   .then(console.log)
//   .catch(console.log);

// Stock.parseFilingFilesByTicker('KR', '10-Q')
//   .then(console.log)
//   .catch(console.log);

// console.log(JSON.stringify(require('./resources/stocks/KR/stock.json').filings.quarterly, null, 2));

// Stock.find('GM', 'Dividends')
//   .then(console.log)
//   .catch(console.log);

// Stock.find('GM', 'EarningsPerShareBasic')
//   .then(console.log)
//   .catch(console.log);

// Stock.find('KR', 'EarningsPerShareDiluted', '10-K')
//   .then(console.log)
//   .catch(console.log);

// Stock.find('KR', 'CurrentFiscalYearEndDate', '10-Q')
//   .then(console.log)
//   .catch(console.log);

// Stock.find('KR', 'DocumentPeriodEndDate', '10-Q')
//   .then(console.log)
//   .catch(console.log);

// Stock.find('KR', 'EarningsPerShareDiluted')
//   .then(console.log)
//   .catch(console.log);

Stock.crawlStocks('12-09-2017.json')
  .then(console.log)
  .catch(console.log);
