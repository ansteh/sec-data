const _ = require('lodash');
const moment = require('moment');

const Stocks = require('../../../stocks.js');
const Securities = require('../../securities/identification/index.js');

const searchOptions = {
  tickers: ['AAPL', 'GM'],
  range: { start: new Date('2016-01-02T23:00:00.000Z') }
};

// Stocks.getAllHistoricalsByTickers(searchOptions)
//   .then(console.log)
//   .catch(console.log)

// Securities.getISINtoTickersByResourceFile()
//   .then(console.log)
//   .catch(console.log)

const getTransaction = () => {
  return Promise.resolve(require(`${__dirname}/../../../../lib/account/importers/degiro/resources/transactions.json`))
    .then((transactions) => {
      return _
        .chain(transactions)
        .map((transaction) => {
          transaction.date = moment(transaction.date, 'DD-MM-YYYY').toDate();
          return transaction;
        })
        .sortBy('date')
        .value();
    });
};

const getHistoricalsBy = (transactions) => {
  const isins = _.uniq(_.map(transactions, 'ISIN'));

  return Securities.getISINtoTickersByResourceFile()
    .then((isinsToTickers) => {
      return _
        .chain(isins)
        .map(isin => isinsToTickers[isin])
        .filter(_.isString)
        .value();
    })
    .then((tickers) => {
      if(tickers.length > 0) {
        const start = _.first(transactions).date;
        return Stocks.getAllHistoricalsByTickers({ tickers, range: { start } })
      }
    })
};

const getValuation = () => {
  return getTransaction()
    .then(getHistoricalsBy)
};

getValuation()
  .then(console.log)
  .catch(console.log);
