const _ = require('lodash');
const moment = require('moment');

const Stocks = require('../../../stocks.js');
const Securities = require('../../securities/identification/index.js');

const QUOTE_VIEWS = {
  rate: ['date', 'rate'],
  portfolio: ['date', 'commitment', 'netValue', 'rate'],
};

const getValuation = (view) => {
  const properties = _.get(QUOTE_VIEWS, view);

  return getTransaction()
    .then((transactions) => {
      return Promise.all([
        getPortfolioHistoricals(transactions),
        getPortfolioSharesCompositionByDate(transactions),
        getCommitmentByDate(transactions),
      ])
      .then(([historicals, shareCompositionByDate, commitment]) => {
        return { historicals, shareCompositionByDate, commitment };
      })
    })
    .then(setNetValueByClose)
    .then(setValuations)
    .then(pickInsightsBy(properties))
    // .then(series => _.slice(series, series.length - 100))
};

const setValuations = (series) => {
  return _
    .chain(series)
    .forEach((quote) => {
      quote.rate = _.round(quote.netValue / quote.commitment, 4);
    })
    .value();
};

const pickInsightsBy = _.curry((properties, series) => {
  if(!properties) {
    return series;
  }

  return _.map(series, quote => _.pick(quote, properties));
});

const setNetValueByClose = ({ shareCompositionByDate, historicals, commitment }) => {
  let previousSharedComposition;
  let currentCommitment = {};

  return _.map(historicals, (historical) => {
    const date = moment(historical.date).startOf('day').format('YYYY-MM-DD');
    const shares = shareCompositionByDate[date] || previousSharedComposition;
    const commitmentByDate = commitment[date] || {};

    historical.netValue = 0;
    historical.commitment = 0;

    _.forOwn(historical.entries, (quote, ticker) => {
      quote.amount = shares[ticker] || 0;
      quote.netValue = quote.amount * quote.close;
      historical.netValue += quote.netValue;

      quote.commitment = (currentCommitment[ticker] || 0) + ((commitmentByDate[ticker] || 0) * quote.close);
      quote.rate = _.round(quote.netValue / quote.commitment, 4);

      historical.commitment += quote.commitment;
      currentCommitment[ticker] = quote.commitment;
    });

    // _.forOwn(historical.entries, (quote, ticker) => {
    //   quote.weight = _.round(quote.netValue / historical.netValue, 4);
    // });

    previousSharedComposition = _.cloneDeep(shares);

    return historical;
  });
};

const getPortfolioSharesCompositionByDate = (transactions) => {
  // return _.slice(transactions, 10, 20);

  return Securities.getISINtoTickersByResourceFile()
    .then((isinsToTickers) => {
      return _
        .chain(transactions)
        .groupBy(transaction => moment(transaction.date).format('YYYY-MM-DD'))
        .reduce((compositions, transactions, date) => {
          const composition = _.reduce(transactions, (composition, { ISIN, amount }) => {
            const ticker = isinsToTickers[ISIN];

            if(ticker) {
              composition[ticker] = composition[ticker] || 0;
              composition[ticker] += amount;
            } else {
              console.error(`missing ticker for ISIN: ${ ISIN }`);
            }

            return composition;
          }, {});

          const previous = _.last(compositions);

          if(previous) {
            const current = _.cloneDeep(previous);

            const tickers = _.uniq([
              ..._.keys(current.shares),
              ..._.keys(composition),
            ]);

            _.forOwn(tickers, (ticker) => {
              current.shares[ticker] = (current.shares[ticker] || 0) + (composition[ticker] || 0);
            });

            compositions.push({ date, shares: current.shares });
          } else {
            compositions.push({ date, shares: composition });
          }

          return compositions;
        }, [])
        .reduce((graph, { date, shares }) => {
          return _.set(graph, date, shares);
        }, {})
        .value();
    });
};

const getCommitmentByDate = (transactions) => {
  return Securities.getISINtoTickersByResourceFile()
    .then((isinsToTickers) => {
      return _
        .chain(transactions)
        .groupBy(transaction => moment(transaction.date).format('YYYY-MM-DD'))
        .reduce((compositions, transactions, date) => {
          const composition = _.reduce(transactions, (composition, { ISIN, amount }) => {
            const ticker = isinsToTickers[ISIN];

            if(ticker) {
              composition[ticker] = composition[ticker] || 0;
              composition[ticker] += amount;
            } else {
              console.error(`missing ticker for ISIN: ${ ISIN }`);
            }

            return composition;
          }, {});

          compositions.push({ date, shares: composition });

          return compositions;
        }, [])
        .reduce((graph, { date, shares }) => {
          return _.set(graph, date, shares);
        }, {})
        .value();
    });
};

const getPortfolioHistoricals = (transactions) => {
  return getHistoricalsBy(transactions)
    .then((historicals) => {
      return { transactions, historicals };
    })
    .then(createPortfolioHistoricals);
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
        return Stocks.getAllHistoricalsByTickers({ tickers, range: { start } })
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
      // console.log(step, moment(quote.date).startOf("day"), stockIndices);

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

  return series;
};

module.exports = {
  getTransaction,
  getValuation,
};
