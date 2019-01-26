const _         = require('lodash');
const Promise   = require('bluebird');

const Resources = require('../stock.resources.js');

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

module.exports = {
  updateAllStocksByResources,
}
