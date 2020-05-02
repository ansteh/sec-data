import * as _ from 'lodash';

const BENCHMARKS = {
  worst: {
    health: {
      danger: 0,
      medicore: 0.4,
      durable: 0.8,
    },
  },
  medicore: {
    health: {
      danger: 0.2,
      medicore: 0.6,
      durable: 0.9,
    },
  },
  durable: {
    health: {
      danger: 0.4,
      medicore: 0.7,
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
    audit.scenarios[scenario] = analyse(portfolio, setup);
    audit.value = audit.scenarios[scenario].value;
  });

  audit.score = getValuation(portfolio);
  audit.positions = getPositions(portfolio);

  return audit;
}

const analyse = (portfolio, benchmarks) => {
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

    if(position.marginOfSafety) {
      marginOfSafety += position.weight * position.marginOfSafety;
      downside += benchmarks.health[position.stock.health] * value * (1 + position.marginOfSafety);
      upside += value * (1 + position.marginOfSafety);
    }
  });

  totalValue = _.round(totalValue, 2);
  downside = _.round(downside, 2);
  upside = _.round(upside, 2);

  // console.log('stocks', _.map(positions, 'stock'));

  return {
    value: totalValue,
    downside: downside/totalValue-1,
    upside: upside/totalValue-1,
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

const getValuation = (positions) => {
  return _
    .chain(positions)
    .sumBy((position) => {
      if(_.has(position, 'stock.valuation.score')) {
        return position.weight * _.get(position, 'stock.valuation.score') || 0;
      } else {
        console.log(`No score defined for:`, position);
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

      return {
        ticker: _.get(position, 'ticker')
          || _.get(stock, 'valuation.ticker')
          || _.get(stock, 'ticker'),

        weight: _.get(position, 'weight'),
        score: _.get(stock, 'valuation.score'),
        value: _.get(position, 'value') || getNominalValue(position),
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
}
