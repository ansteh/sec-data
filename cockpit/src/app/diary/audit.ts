import * as _ from 'lodash';

import * as Portfolio from './portfolio';

const BENCHMARKS = {
  worst: {
    health: {
      danger: 0,
      medicore: 0.2,
      durable: 0.4,
    },
  },
  medicore: {
    health: {
      danger: 0.2,
      medicore: 0.4,
      durable: 0.8,
    },
  },
  durable: {
    health: {
      danger: 0.4,
      medicore: 0.8,
      durable: 1,
    },
  }
};

export const createAudit = (portfolio: any, label?: string) => {
  const benchmarks = BENCHMARKS;

  const audit = {
    label,
    scenarios: {},
    score: null,
    value: null,
    positions: null,
  };

  _.forOwn(benchmarks, (setup, scenario) => {
    audit.scenarios[scenario] = analyse(portfolio, setup, scenario);
    audit.value = audit.scenarios[scenario].value;
  });

  audit.score = getValuation(portfolio);
  audit.positions = getPositions(portfolio);

  return audit;
};

const analyse = (portfolio, benchmarks, scenario) => {
  const assets = _.filter(portfolio, position => position.count);
  const [positions, unmatches] = _.partition(assets, item => item.stock);
  // if(unmatches.length > 0) console.log('unmatches', unmatches);

  let totalValue = _.sumBy(positions, getNominalValue),
    marginOfSafety = 0,
    downside = 0,
    upside = 0;

  _.forEach(positions, (position) => {
    const value = getNominalValue(position);
    position.weight = value/totalValue;
    // position.marginOfSafety = position.marginOfSafety || position.stock.marginOfSafety;
    position.marginOfSafety = position.stock.fcf_mos; //position.marginOfSafety || position.stock.marginOfSafety;

    // TODO: adjust curreny conversion or stock splits
    if(position.marginOfSafety && ['NYSE:BRK.B', 'DB:LUK'].indexOf(position.stock.ticker) === -1) {
      marginOfSafety += position.weight * position.marginOfSafety;
      // downside += Math.max(0, benchmarks.health[position.stock.health] * value * (1 + position.marginOfSafety));
      // upside += Math.max(0, value * benchmarks.health['durable'] * (1 + position.marginOfSafety));

      const fairPrice = getFairValue(position.marginOfSafety, position.stock.price);
      const fairValue = fairPrice * position.count;
      // console.log(position.stock.ticker, position.stock.price, fairValue, value);
      downside += Math.max(0, benchmarks.health[position.stock.health] * fairValue);
      upside += Math.max(0, benchmarks.health['durable'] * fairValue);
    }
  });

  totalValue = _.round(totalValue, 2);
  downside = _.round(downside, 2);
  upside = _.round(upside, 2);

  // console.log('stocks', _.map(positions, 'stock'));

  return {
    value: totalValue,
    downside: 1 - totalValue/downside,
    upside: 1 - totalValue/upside,
    range: {
      downside,
      upside,
    },
    marginOfSafety,
    misfits: _.filter(positions, position => !position.marginOfSafety),
  };
};

const getNominalValue = ({ count, stock }) => {
  return count * stock.price;
};

const getFairValue = (margin, price) => {
  // console.log(margin, price);
  return price/(1 - margin) || 0;
};

const getValuation = (positions) => {
  return _
    .chain(positions)
    .sumBy((position) => {
      if(_.has(position, 'stock.valuation.score')) {
        return position.weight * _.get(position, 'stock.valuation.score') || 0;
      } else {
        // console.log(`No score defined for:`, position);
        return 0;
      }
    })
    .value();
};

export const getPositions = (positions) => {
  // console.log('stocks', stocks);

  return _
    .chain(positions)
    .filter(position => _.get(position, 'count'))
    .map((position: any) => {
      const { stock } = position;

      // const margin = _.get(stock, 'marginOfSafety');
      // const price = _.get(stock, 'price');
      // const fairValue = getFairValue(margin, price);

      return {
        ticker: _.get(position, 'ticker')
          || _.get(stock, 'valuation.ticker')
          || _.last((_.get(stock, 'ticker') || '').split(':')),

        weight: _.get(position, 'weight'),
        score: _.get(stock, 'valuation.score'),
        value: _.get(position, 'value') || getNominalValue(position),
        margin: _.get(position, 'marginOfSafety'),

        count: _.get(position, 'count'),
        price: _.get(stock, 'price'),
      };
    })
    .orderBy(['weight'], ['desc'])
    .value();
};

export const log = (audit: any) => {
  console.log(audit.label);
  console.log('positions:', audit.positions);

  _.forOwn(audit.scenarios, (results, scenario) => {
    console.log(scenario, results);
  });

  console.log('portfolio company score:', audit.score);
};

export const findHighestScoreCandidates = (universe: any[], loops = 100) => {
  let counter = 0, state = { audit: null, candidates: null };

  do {
    const portfolio = Portfolio.create({
      budget: 100000,
      candidates: _.shuffle(universe),
    });

    const audit = createAudit(portfolio);

    // if(higherScore(audit, state.audit)) {
    if(higherValue(audit, state.audit)) {
      console.log('audit', audit);
      state.audit = audit;
      state.candidates = _
        .chain(audit.positions)
        .map(({ ticker }) => {
          if(ticker) {
            return _.find(universe, (stock) => {
              return ticker === _.last(stock.ticker.split(':'));
            });
          }
        })
        // .filter()
        .value();
    }

    counter += 1;
  } while(counter < loops);

  return state.candidates;
};

const higherScore = (audit, counterpart) => {
  return _.get(audit, 'score', 0) > _.get(counterpart, 'score', 0);
};

const higherValue = (audit, counterpart) => {
  return getScoreValue(audit) > getScoreValue(counterpart);
};

const getScoreValue = (audit) => {
  return _.get(audit, 'score', 0) * _.get(audit, 'scenarios.worst.downside', 0);
};
