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

getHistoricals({ ticker: 'GM', range: { start: '2012-01-02T23:00:00.000Z'} })
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

// insertStocksByResources()
//   .then(() => { console.log(`Insertions finished!`) })
//   .catch(console.log);

// findAllTickers()
//   .then(console.log)
//   .catch(console.log);

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

// updateAllStocksByResources()
//   .then(() => { console.log(`All stocks have been updated!`) })
//   .catch(console.log)
