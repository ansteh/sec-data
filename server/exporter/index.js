const _         = require('lodash');
const Resources = require('./stock.resources.js');
const Promise   = require('bluebird');

const {
  dropCollection,
  findAllTickers,
  findByTicker,
  findStocks,
  getHistoricals,
  insertStocks,
  updateStock,
} = require('../stocks.js');

const updateStockResourcesBy = (ticker) => {
  return Resources.getStock(ticker)
    .then(updateStock)
};

const insertStocksByResources = () => {
  return Promise
    .all([
      Resources.getAllTickers(),
      findAllTickers().then(results => _.map(results, 'ticker')),
    ])
    .then(([resources, insertedTickers]) => {
      return _.filter(resources, (ticker) => {
        return _.includes(insertedTickers, ticker) === false;
      })
    })
    .then((tickers) => {
      const stocks = tickers.map((ticker) => {
        return { ticker };
      });

      return insertStocks(stocks);
    })
    // .then((tickers) => {
    //   return Promise.all(tickers.map((ticker) => {
    //     return updateStockResourcesBy(ticker)
    //       .then(() => { console.log(`${ticker} has been inserted!`) })
    //   }))
    // })
};

const updateNextStockByTickers = (tickers) => {
  const ticker = _.head(tickers);

  if(ticker) {
    return updateStockResourcesBy(ticker)
      .then(() => {
        return updateNextStockByTickers(_.tail(tickers));
      })
  }
};

const updateAllStocksByResources = () => {
  return Resources.getAllTickers()
    .then((tickers) => {
      return updateNextStockByTickers(tickers);
    })
};

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

// updateStockResourcesBy('GM')
//   .then(console.log)
//   .catch(console.log);

// insertStocksByResources()
//   .then(() => { console.log(`Insertions finished!`) })
//   .catch(console.log);

// findAllTickers()
//   .then(console.log)
//   .catch(console.log);

// updateAllStocksByResources()
//   .then(() => { console.log(`All stocks have been updated!`) })
//   .catch(console.log)
