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

Tickers.getFilingTypes('0001017480')
  .then(console.log)
  .catch(console.log);
