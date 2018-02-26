const _         = require('lodash');
const Resources = require('./stock.resources.js');

const {
  insertStocks,
  findStocks,
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

findStocks({})
  .then(stocks => console.log(_.get(_.first(stocks), 'historicals')))
  .catch(console.log);

// execute(dropCollection('stocks'))
//   .then(console.log)
//   .catch(console.log);

const updateStockResourcesBy = (ticker) => {
  return Resources.getStock(ticker)
    .then(updateStock)
};

// updateStockResourcesBy('AAPL')
//   .then(console.log)
//   .catch(console.log);
