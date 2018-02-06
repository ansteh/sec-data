const _ = require('lodash');

const fundamentals  = require('../fundamentals/metrics');
const growthRate    = require('../modules/timeseries/growthRate.js');
const take          = require('../modules/timeseries/take.js');

const Summary = require('../stock/summary/model.js');

// FundamentalAccountingConcepts.Revenues
// FundamentalAccountingConcepts.GrossProfit

const sliceMetricByPath = (market, ticker, path, date) => {
  const summary = market.getSummary(ticker);
  return Summary.take(summary, path, date);
};

const getFundamentalGrowthRate = (market, ticker, path, date) => {
  // const series = market.getMetric(ticker, path);
  // const slice = take(series, 'endDate', date);
  const summary = market.getSummary(ticker);
  const slice = Summary.take(summary, path, date);

  if(slice && slice.length > 1) {
    const growthRates = growthRate(_.map(slice, 'value'));
    const meanGrowthRate = _.mean(growthRates);
    // console.log(`${ticker} ${path} meanGrowthRate:`, meanGrowthRate);

    return meanGrowthRate;
  }
};

const logCandidates = (candidates) => {
  // console.log('candidates', candidates);
  const path = 'annual.DerivedDCF_IntrinsicValue_MAX_GROWTH_RATE_20_BY_MEAN';

  _.forOwn(candidates, (value, ticker) => {
    console.log(ticker, _.get(value[path], 'margin'));
  });
};

const filterCandidatesForBuying = (candidates, { date, findStateByPath, market }) => {
  console.log(`candidates before strategy filter: ${_.keys(candidates).length}`);
  // logCandidates(candidates);

  _.forOwn(candidates, (candidate) => {
    const ticker = _.get(candidate, 'ticker');

    const path = 'annual.DerivedDCF_IntrinsicValue_MAX_GROWTH_RATE_20_BY_MEAN';
    const margin = _.get(candidate[path], 'margin');

    if(!margin || margin < 0) {
      delete candidates[ticker];
      return;
    }

    const stock = market.getStock(ticker);

    const grossProfitRate = getFundamentalGrowthRate(market, ticker, 'annual.FundamentalAccountingConcepts.GrossProfit', date);
    if(_.isNaN(grossProfitRate) || grossProfitRate < 0.07) {
      delete candidates[ticker];
      return;
    }

    const revenuesRate = getFundamentalGrowthRate(market, ticker, 'annual.FundamentalAccountingConcepts.Revenues', date);
    if(_.isNaN(revenuesRate) || revenuesRate < 0.07) {
      delete candidates[ticker];
      return;
    }

    const trailingTwelveMonthsEarningsPerShareDiluted = fundamentals
      .getTrailingTwelveMonthsEarningsPerShareDilutedBySummary(stock.summary, date);
    // console.log('trailingTwelveMonthsEarningsPerShareDiluted', trailingTwelveMonthsEarningsPerShareDiluted);

    let PE = _.get(candidate['annual.EarningsPerShareDiluted'], 'fact.res');
    if(_.isUndefined(PE)) {
      const state = findStateByPath('annual.EarningsPerShareDiluted', date, ticker);
      const earningsPerShareDiluted = _.get(state, 'fact.value');
      const price = _.get(state, 'entry.close');

      // console.log(state);
      // console.log('earningsPerShareDiluted', earningsPerShareDiluted);
      // console.log('trailingTwelveMonthsEarningsPerShareDiluted', trailingTwelveMonthsEarningsPerShareDiluted);

      const earnings = trailingTwelveMonthsEarningsPerShareDiluted || earningsPerShareDiluted;

      PE = price/earnings;
    }
    // console.log('PE', PE);

    if(PE < 1 || PE > 15) {
      delete candidates[ticker];
      return;
    }

    let PB = _.get(candidate['annual.DerivedBookValuePerShare'], 'fact.res');
    if(_.isUndefined(PB)) {
      const state = findStateByPath('annual.DerivedBookValuePerShare', date, ticker);
      // PB = _.get(state, 'fact.res');

      const bookValuePerShare = _.get(state, 'fact.value');
      const price = _.get(state, 'entry.close');

      PB = price/bookValuePerShare;
    }
    // console.log('PB', PB);

    if(PB < 0.5 || PB > 1.5) {
      delete candidates[ticker];
      return;
    }

    // const rate = _.get(candidate['annual.FundamentalAccountingConcepts.NetIncomeLoss'], 'fact');
    // const state = findStateByPath('annual.FundamentalAccountingConcepts.NetCashFlow', date, ticker);
    // const rate = _.get(state, 'fact');
    // console.log(ticker, rate);

    // if(!rate || (_.isNumber(rate) && rate < 0.07)) {
    //   delete candidates[ticker];
    // }
  });

  return candidates;
};

const filterCandidates = (candidates, { date, findStateByPath, market }) => {
  console.log(`candidates before strategy filter: ${_.keys(candidates).length}`);

  _.forOwn(candidates, (candidate) => {
    const ticker = _.get(candidate, 'ticker');

    const path = 'annual.DerivedDCF_IntrinsicValue_MAX_GROWTH_RATE_20_BY_MEAN';
    const margin = _.get(candidate[path], 'margin');

    if(!margin || margin < 0) {
      delete candidates[ticker];
      return;
    }

    _.set(candidate, 'params.margin', margin);

    const stock = market.getStock(ticker);

    const grossProfitRate = getFundamentalGrowthRate(market, ticker, 'annual.FundamentalAccountingConcepts.GrossProfit', date);
    // if(_.isNaN(grossProfitRate) || grossProfitRate < 0.07) {
    //   delete candidates[ticker];
    //   return;
    // }
    _.set(candidate, 'params.grossProfitRate', grossProfitRate);


    const revenuesRate = getFundamentalGrowthRate(market, ticker, 'annual.FundamentalAccountingConcepts.Revenues', date);
    // if(_.isNaN(revenuesRate) || revenuesRate < 0.07) {
    //   delete candidates[ticker];
    //   return;
    // }
    _.set(candidate, 'params.revenuesRate', revenuesRate);

    const trailingTwelveMonthsEarningsPerShareDiluted = fundamentals
      .getTrailingTwelveMonthsEarningsPerShareDilutedBySummary(stock.summary, date);
    // console.log('trailingTwelveMonthsEarningsPerShareDiluted', trailingTwelveMonthsEarningsPerShareDiluted);

    let PE = _.get(candidate['annual.EarningsPerShareDiluted'], 'fact.res');
    if(_.isUndefined(PE)) {
      const state = findStateByPath('annual.EarningsPerShareDiluted', date, ticker);
      const earningsPerShareDiluted = _.get(state, 'fact.value');
      const price = _.get(state, 'entry.close');

      // console.log(state);
      // console.log('earningsPerShareDiluted', earningsPerShareDiluted);
      // console.log('trailingTwelveMonthsEarningsPerShareDiluted', trailingTwelveMonthsEarningsPerShareDiluted);

      const earnings = trailingTwelveMonthsEarningsPerShareDiluted || earningsPerShareDiluted;

      PE = price/earnings;
    }
    // console.log('PE', PE);

    if(PE < 1 || PE > 15) {
      delete candidates[ticker];
      return;
    }
    _.set(candidate, 'params.PE', PE);

    let PB = _.get(candidate['annual.DerivedBookValuePerShare'], 'fact.res');
    if(_.isUndefined(PB)) {
      const state = findStateByPath('annual.DerivedBookValuePerShare', date, ticker);
      // PB = _.get(state, 'fact.res');

      const fact = _.last(sliceMetricByPath(market, ticker, 'annual.DerivedBookValuePerShare', date));
      const bookValuePerShare = _.get(fact, 'value');
      // const bookValuePerShare = _.get(state, 'fact.value');
      const price = _.get(state, 'entry.close');
      PB = price/bookValuePerShare;
    }
    // console.log('PB', PB);

    // if(PB < 0.5 || PB > 1.5) {
    //   delete candidates[ticker];
    //   return;
    // }
    _.set(candidate, 'params.PB', PB);

    // const rate = _.get(candidate['annual.FundamentalAccountingConcepts.NetIncomeLoss'], 'fact');
    // const state = findStateByPath('annual.FundamentalAccountingConcepts.NetCashFlow', date, ticker);
    // const rate = _.get(state, 'fact');
    const netCashFlowRate = getFundamentalGrowthRate(market, ticker, 'annual.FundamentalAccountingConcepts.NetCashFlow', date);


    // console.log(ticker, rate);

    // if(!rate || (_.isNumber(rate) && rate < 0.07)) {
    //   delete candidates[ticker];
    // }
    _.set(candidate, 'params.NetCashFlowRate', netCashFlowRate);
  });

  return candidates;
};

module.exports = {
  filterCandidatesForBuying,
  filterCandidates,
}
