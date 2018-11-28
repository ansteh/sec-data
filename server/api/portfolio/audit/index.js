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

const getValuation = () => {
  return getTransaction()
    .then((transactions) => {
      return getHistoricalsBy(transactions)
        .then((historicals) => {
          return { transactions, historicals };
        });
    })
    .then(createPortfolioHistoricals)
};

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
        return Stocks.getAllHistoricalsByTickers({ tickers: ['AAPL'], range: { start } })
      }
    })
};

const createPortfolioHistoricals = ({ transactions, historicals }) => {
  const { start, end } = getRange({ transactions, historicals });
  return createSeries({ start, end, historicals });
};

const getRange = ({ transactions, historicals }) => {
  const start = _.get(_.first(transactions), 'date');

  const end = _
    .chain(historicals)
    .map('historicals')
    .map((historicals) => {
      return _.maxBy(historicals, 'date');
    })

    .map('date')
    .max()
    .value();

  return { start, end };
};

const createSeries = ({ start, end, historicals }) => {
  const series = [];
  const endDate = moment(end);
  let step = moment(start).clone();

  const stockIndices = {};

  do {
    // console.log(step);

    const portfolioQuote = {
      date: step.clone().toDate(),
      entries: {},
    };

    _.forEach(historicals, ({ ticker, historicals }, index) => {
      const stockIndex = stockIndices[index] || 0;
      let quote = historicals[stockIndex];

      // if(ticker === 'AAPL') { console.log(historicals.length); }
      // if(!(quote && step.isSame(moment(quote.date).startOf("day")))) {
      //   console.log(step, moment(quote.date).startOf("day"), stockIndices);
      // }
      console.log(step, moment(quote.date).startOf("day"), stockIndices);

      if(quote && step.isSame(moment(quote.date).startOf("day"))) {
        // console.log('quote && step.isSame');
        // console.log(step, quote.date);
        stockIndices[index] = stockIndex + 1;
      } else {
        if(stockIndex > 0) {
          quote = historicals[stockIndex - 1];
        }
      }

      if(quote) {
        portfolioQuote.entries[ticker] = quote;
      }
    });

    step.add(1, 'day');

    series.push(portfolioQuote);
  } while(moment(step).isSameOrBefore(endDate));

  return series;// .then(_.last)
  // .then(content => JSON.stringify(content, null, 2))
  // .then(con
};

getValuation()
  .then(_.last)
  .then(content => JSON.stringify(content, null, 2))
  .then(console.log)
  .catch(console.log);
