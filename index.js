const fs        = require('fs');

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

// Stock.crawlStock(HIBB);

// Stock.parseFilingFilesByTicker('HIBB')
//   .then(console.log)
//   .catch(console.log);

// Stock.find('GM', 'Dividends')
//   .then(console.log)
//   .catch(console.log);

// Stock.find('GM', 'EarningsPerShareBasic')
//   .then(console.log)
//   .catch(console.log);

Stock.find('GM', 'EarningsPerShareDiluted')
  .then(console.log)
  .catch(console.log);
