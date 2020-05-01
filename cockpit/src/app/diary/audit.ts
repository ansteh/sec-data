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

export const createAudit = (label: string, portfolio: any) => {
  const benchmarks = BENCHMARKS;

  const audit = {
    label,
    scenarios: {},
    score: null,
    value: null,
  };

  _.forOwn(benchmarks, (setup, scenario) => {
    audit.scenarios[scenario] = analyse(portfolio, setup);
    audit.value = audit.scenarios[scenario].value;
  });

  audit.score = getValuation(portfolio);

  return audit;
}

const analyse = (portfolio, benchmarks) => {
  const assets = _.filter(portfolio, stock => stock.count);
  const [stocks, unmatches] = _.partition(assets, item => item.stock);
  // if(unmatches.length > 0) console.log('unmatches', unmatches);

  let totalValue = _.sumBy(stocks, getNominalValue),
    marginOfSafety = 0,
    downside = 0,
    upside = 0;

  _.forEach(stocks, (stock) => {
    const value = getNominalValue(stock);
    stock.weight = value/totalValue;
    // stock.marginOfSafety = stock.marginOfSafety || stock.stock.marginOfSafety;
    stock.marginOfSafety = stock.stock.fcf_mos; //stock.marginOfSafety || stock.stock.marginOfSafety;

    if(stock.marginOfSafety) {
      marginOfSafety += stock.weight * stock.marginOfSafety;
      downside += benchmarks.health[stock.stock.health] * value * (1 + stock.marginOfSafety);
      upside += value * (1 + stock.marginOfSafety);
    }
  });

  totalValue = _.round(totalValue, 2);
  downside = _.round(downside, 2);
  upside = _.round(upside, 2);

  // console.log('stocks', _.map(stocks, 'stock'));

  return {
    value: totalValue,
    downside: downside/totalValue-1,
    upside: upside/totalValue-1,
    range: {
      downside,
      upside,
    },
    marginOfSafety,
    misfits: _.filter(stocks, stock => !stock.marginOfSafety)
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
