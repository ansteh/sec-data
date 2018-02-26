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

// execute(insertStocks(stocks))
//   .then((rows) => {
//     console.log('insertStocks inserted', rows);
//   })
//   .catch(console.log);

// findStocks({})
//   .then(stocks => console.log(_.get(_.first(stocks), 'historicals')))
//   .catch(console.log);

getHistoricals({ start: '2012-01-02T23:00:00.000Z'})
  .then(console.log)
  .catch(console.log);

const updateStockResourcesBy = (ticker) => {
  return Resources.getStock(ticker)
    .then(updateStock)
};

// updateStockResourcesBy('AAPL')
//   .then(console.log)
//   .catch(console.log);
