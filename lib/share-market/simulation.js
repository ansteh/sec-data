const _ = require('lodash');
const moment = require('moment');

const Spreads   = require('./extensions/spreads');
const Portfolio = require('./portfolio.js');

const getTotalShareCap = (shares) => {
  return _.reduce(shares, (cap, share) => {
    return cap + (share.price * share.count);
  }, 0);
};

const setShareStakes = (shares, netWealth) => {
  _.forEach(shares, (share) => {
    share.stake = netWealth !== 0 ? share.cap/netWealth : 0;
  });
};

const create = ({
  market,
  timeline,
  findAllStates,
  findStateByPath,
  strategies,
}) => {
  const managePortfolio = true;
  const rebalance = true;

  const shares = {};
  const buyMargin = 0.7;
  const sellMargin = 0.1;

  const start = _.clone(_.first(timeline));
  let lastBalanced = _.clone(start);

  let maxStake = 0.2;
  let budget = 10;

  let cash = 0;
  let invested = 0;
  let netWealth = 0;

  let transactionRate = 0.015;
  let transactionCost = 1.5;
  let totalTransactionCost = 0;

  const logShares = () => {
    const rows = _
    .chain(shares)
    .map((share, ticker) => {
      return {
        ticker,
        // value: Math.round(share.value * 100)/100,
        margin: Math.round(share.margin * 10000)/100,
        cap: Math.round(share.cap * 100)/100,
        stake: netWealth !== 0 ? Math.round(share.cap/netWealth * 100)/100 : 0,
      };
    })
    .sortBy('stake')
    .reverse()
    .value();

    console.log(rows);
  };

  const logPortfolio = (date) => {
    logShares();

    // console.log('total share cap', getTotalShareCap(shares))

    const yearRate = getGrowthRate(start, date);
    const pastDays = moment(date).diff(moment(start), 'days');
    console.log('yearRate', yearRate, (invested * Math.pow(1+yearRate, pastDays/365)));

    const cumulativeMargin = _.mean(_.map(_.values(shares), 'margin'));

    console.log(
      date,
      `invested: ${Math.floor(invested)}`,
      `net: ${Math.floor(netWealth + cash)}`,
      `expansion: ${Math.floor((netWealth + cash)/invested * 100)/100}`,
      `cash: ${Math.floor(cash)}`,
      `cum margin: ${Math.round(cumulativeMargin * 100)}`,
      `trans: ${Math.round(totalTransactionCost)}`,
    );
  };

  const simulate = (path) => {
    _.forEach(timeline, (date) => {
      cash += budget;
      invested += budget;

      const states = findAllStates(date);

      // console.log(_.keys(states));

      updateShares(states, path);

      if(rebalance) {
        if(moment(date).diff(lastBalanced, 'days') > 365) {
          lastBalanced = _.clone(date);
          balancePortfolio(states, path);
        }
      }

      sellShares(states, path, _.get(strategies, 'filterCandidatesForBuying'));
      buyShares(states, path, date, _.get(strategies, 'filterCandidatesForBuying'));
      updateNetWealth(states, path);

      logPortfolio(date);
    });

    console.log(shares);
  };

  const updateShares = (states, path) => {
    delete states['ESV'];
    delete states['FDP'];

    _.forOwn(shares, (share, ticker) => {
      const state = states[ticker][path];

      if(state) {
        if(_.has(state.entry, 'close')) {
          const { close } = state.entry;
          share.price = close;
          share.cap = share.price * share.count;
          share.value = _.get(state, 'fact.value');
          share.margin = _.get(state, 'margin');
        } else {
          console.log(`update stock missing price for: ${ticker}`);
        }
      } else {
        console.log(`update stock state missing for: ${ticker}`);
      }
    });
  };

  const sellAllShares = () => {
    _.forOwn(shares, (share, ticker) => {
      const result = share.count * share.price;
      cash += result;

      cash -= transactionCost;
      totalTransactionCost += transactionCost;

      delete shares[ticker];
    });
  };

  const balancePortfolio = (states, path) => {
    console.log('rebalance portfolio!');

    const tickers = _.keys(shares);

    const candidates = _.pickBy(states, (state, ticker) => {
      return _.includes(tickers, ticker);
    });

    sellAllShares();
    buySharesOfCandidates(path, candidates, true);
  };

  const sellShares = (states, path, filter) => {
    const toDeleteTickers = [];

    _.forOwn(shares, (share, ticker) => {
      const state = states[ticker][path];
      if(!state) return true;

      if(_.isUndefined(state.margin)) {
        const result = share.count * share.price;
        cash += result;

        toDeleteTickers.push(ticker);
      }

      if(_.isNumber(state.margin)) {
        if(state.margin < sellMargin) {
          const result = share.count * share.price;
          cash += result;

          // transaction cost
          // cash -= transactionRate*result;
          cash -= transactionCost;
          totalTransactionCost += transactionCost;

          toDeleteTickers.push(ticker);
        }
      }
    });

    // console.log('sold: ', toDeleteTickers);

    _.forEach(toDeleteTickers, (ticker) => {
      delete shares[ticker];
    });
  };

  const buySharesOfCandidates = (path, candidates, stakeCash) => {
    _.forOwn(candidates, (candidate, ticker) => {
      if(cash < 300) return;

      const { close } = candidate[path].entry;

      let count = Math.floor(cash/close);

      if(stakeCash) {
        count = Math.floor((maxStake * cash) / close);
      }

      if(managePortfolio) {
        const share = shares[ticker];
        if(share) {
          const maxShareCount = Portfolio.getMaxShareCount(maxStake, shares[ticker], netWealth);
          count = Math.min(count, maxShareCount);
        }
      }

      if(count > 0) {
        const cost = count*close;
        cash -= cost;

        console.log(`buy ${count} shares of ${ticker}. Paid total: ${cost}`);

        // transaction cost
        // cash -= transactionRate*result;
        cash -= transactionCost;
        totalTransactionCost += transactionCost;

        let stock = shares[ticker];

        if(!stock) {
          stock = {
            count: 0
          };

          shares[ticker] = stock;
        }

        stock.price = close;
        stock.count += count;
        stock.cap = stock.price * stock.count;
      }
    });
  };

  const buyShares = (states, path, date, filter) => {
    if(cash < 300) return;

    let candidates = {};

    _.forOwn(states, (candidate, ticker) => {
      const metric = candidate[path];
      if(metric && metric.margin && metric.margin > buyMargin) {
        candidate.ticker = ticker;
        candidates[ticker] = candidate;
      }
    });

    if(filter) {
      candidates = filter(candidates, { date, findStateByPath, market });
    }

    if(managePortfolio) {
      setShareStakes(shares, netWealth);
      candidates = Portfolio.removeByStake(maxStake, shares, candidates);
    }

    console.log('candidates count', _.keys(candidates).length);

    candidates = _
      .chain(_.values(candidates))
      .sortBy((candidate) => {
        return _.get(candidate[path], 'margin');
      })
      .reverse()
      .take(10)
      .shuffle()
      .keyBy('ticker')
      .value();

    // console.log(candidates);

    buySharesOfCandidates(path, candidates);
  };

  const updateNetWealth = (states, path) => {
    netWealth = 0;

    _.forOwn(shares, (share, ticker) => {
      const state = states[ticker][path];

      if(state) {
        if(_.has(state.entry, 'close')) {
          const { close } = state.entry;
          netWealth += share.count * close;
        } else {
          console.log(`missing price for: ${ticker} => ${share.price || 0}`);
          netWealth += share.count * (share.price || 0);
        }
      } else {
        console.log(`state missing for: ${ticker}`);
      }
    });
  };

  const getGrowthRate = (start, end) => {
    const multiplier = (netWealth + cash)/invested;
    // const pastDays = moment(end).diff(moment(start), 'days');
    // return Math.pow(multiplier, 365/pastDays) - 1;
    return Spreads.getGrowthRate(multiplier, start, end);
  };

  return {
    simulate,
  }
};

module.exports = {
  create,
};
