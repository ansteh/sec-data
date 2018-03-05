const _         = require('lodash');
const Resources = require('./stock.resources.js');

const {
  insertStocks,
  findStocks,
  getHistoricals,
  dropCollection,
  updateStock,
} = require('./stocks.js');

const stocks = [
  { ticker: 'AAPL' },
  { ticker: 'GM' },
];

// insertStocks(stocks)
//   .then(console.log)
//   .catch(console.log);

// findStocks({})
//   .then(stocks => console.log(_.get(_.first(stocks), 'historicals')))
//   .catch(console.log);

getHistoricals({ start: '2012-01-02T23:00:00.000Z'})
  .then(_.first)
  .then(console.log)
  .catch(console.log);

const updateStockResourcesBy = (ticker) => {
  return Resources.getStock(ticker)
    .then(updateStock)
};

// updateStockResourcesBy('GM')
//   .then(console.log)
//   .catch(console.log);
