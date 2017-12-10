const _ = require('lodash');

const create = ({
  timeline,
  findAllStates,
  strategies,
}) => {
  const shares = {};
  const buyMargin = 0.5;
  const sellMargin = 0.1;

  let budget = 1000;

  let cash = 0;
  let invested = 0;
  let netWealth = 0;

  const simulate = (path) => {
    _.forEach(timeline, (date) => {
      cash += budget;
      invested += budget;

      const states = findAllStates(date);

      // console.log(_.keys(states));

      updateShares(states, path);
      sellShares(states, path, _.get(strategies, 'filterCandidatesForBuying'));
      buyShares(states, path, _.get(strategies, 'filterCandidatesForBuying'));
      updateNetWealth(states, path);

      // account result
      console.log(shares);
      console.log(date, Math.floor(invested), Math.floor(netWealth + cash),  Math.floor(cash));
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
        } else {
          console.log(`update stock missing price for: ${ticker}`);
        }
      } else {
        console.log(`update stock state missing for: ${ticker}`);
      }
    });
  };

  const sellShares = (states, path, filter) => {
    const toDeleteTickers = [];

    _.forOwn(shares, (share, ticker) => {
      const state = states[ticker][path];

      if(state && _.isNumber(state.margin)) {
        if(state.margin < sellMargin) {
          const result = share.count * share.price;
          cash += result;

          toDeleteTickers.push(ticker);
        }
      }
    });

    _.forEach(toDeleteTickers, (ticker) => {
      delete shares[ticker];
    });
  };

  const buyShares = (states, path, filter) => {
    let candidates = {};

    _.forOwn(states, (candidate, ticker) => {
      const metric = candidate[path];
      if(metric && metric.margin && metric.margin > buyMargin) {
        candidate.ticker = ticker;
        candidates[ticker] = candidate;
      }
    });

    if(filter) {
      candidates = filter(candidates);
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

    _.forOwn(candidates, (candidate, ticker) => {
      const { close } = candidate[path].entry;
      const count = Math.floor(cash/close);

      if(count > 0) {
        const cost = count*close;
        cash -= cost;

        let stock = shares[ticker];

        if(!stock) {
          stock = {
            count: 0
          };

          shares[ticker] = stock;
        }

        stock.price = close;
        stock.count += count;
      }
    });

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

  return {
    simulate,
  }
};

module.exports = {
  create,
};
