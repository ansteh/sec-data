const _       = require('lodash');
const Tickers = require('./index.js');

// Tickers.getAll()
//   .then((tickers) => {
//     return _.values(tickers).length;
//   })
//   .then(console.log)
//   .catch(console.log);

// Tickers.getUnexplored()
//   .then((tickers) => {
//     return _.values(tickers).length;
//   })
//   .then(console.log)
//   .catch(console.log);

// Tickers.getCompanyInfos('0001017480')
//   .then(console.log)
//   .catch(console.log);

// Tickers.getAndSaveCompanyInfos('0001017480')
//   .then(console.log)
//   .catch(console.log);

// Tickers.findTickerAsStockCandidate()
//   .then(console.log)
//   .catch(console.log);

// Tickers.findAndFillCompanyInfos();

Tickers.findAndCreateStocks();
