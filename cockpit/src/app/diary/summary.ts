import * as _ from 'lodash';

export const prepare = (summary) => {
  summary.stocks.forEach((item) => {
    item.cashPerShare = item.freeCashFlow/item.shares;
    item.estimatedValue = getEstimatedValue(item);
    item.marginOfSafety = 1 - item.price/item.estimatedValue;
    profile(item);

    if(item.valuation) {
      const dcfs = item.valuation.dcfs.longterm;
      if(dcfs.deps > 0) item.deps_mos = 1 - item.price/dcfs.deps;
      if(dcfs.oeps > 0) item.oeps_mos = 1 - item.price/dcfs.oeps;
      if(dcfs.fcf > 0) item.fcf_mos = 1 - item.price/dcfs.fcf;
    }
  });

  summary.portfolio.forEach((item) => {
    item.stock = _.find(summary.stocks, (stock) => {
      return _.last(stock.ticker.split(':')) === item.ticker;
    });

    if(item.stock) {
      item.marginOfSafety = item.stock.marginOfSafety;
      item.health = item.stock.health;
      item.growth = item.stock.growth;
      item.upside = item.stock.upside;

      if(item.health === 'durable' && item.growth === 'durable') {
        item.suggestion = 'HOLD';
      } else if(item.health === 'danger' || item.growth === 'danger') {
        item.suggestion = 'SELL';
      } else {
        item.suggestion = 'EXAMINE';
      }
    }
  });
  
  return summary;
};

const profile = (stock) => {
  let health = 0;
  if(stock.debtToEquity <= 1) health += 1;
  if(stock.currentRatio >= 0.7) health += 1;
  if(stock.currentRatio >= 0.7) health += 1;
  stock.health = health === 3 ? 'durable' : 'medicore';
  stock.health = health < 2 ? 'danger' : stock.health;

  let growth = 0;
  if(stock.revenue_cagr_5 >= 0.05) growth += 1;
  // if(stock.cashPerShare > 0) stock.growth += 1;
  stock.growth = growth > 0 ? 'durable' : 'medicore';

  // let upside = 0;
  // if(stock.peg < 1.5) stock.upside += 1;
  // if(stock.adjustedPE < 20) stock.upside += 1;
  // stock.upside = upside === 2 ? 'durable' : 'medicore';
};

const getEstimatedValue = (stock) => {
  // return stock.fairValue || 0;
  // return stock.analystValue || 0;
  return _
    .chain([stock.fairValue, stock.analystValue])
    .filter()
    .filter(_.isNumber)
    .mean()
    .value();
};