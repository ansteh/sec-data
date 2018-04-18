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

const getLastMetricValueByPath = (market, ticker, path, date) => {
  const summary = market.getSummary(ticker);

  return _
    .chain(Summary.take(summary, path, date))
    .last()
    .get('value')
    .value();
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

const setToParamsToCandidate = (candidate, key, market, ticker, path, date) => {
  const value = getLastMetricValueByPath(market, ticker, path, date);
  _.set(candidate, `params.${key}`, value);

  const rate = getFundamentalGrowthRate(market, ticker, path, date);
  _.set(candidate, `params.${key}%`, rate);
};

const logCandidates = (candidates) => {
  // console.log('candidates', candidates);
  const path = 'annual.DerivedDCF_IntrinsicValue_MAX_GROWTH_RATE_20_BY_MEAN';

  _.forOwn(candidates, (value, ticker) => {
    console.log(ticker, _.get(value[path], 'margin'));
  });
};

const essentials = (candidates, { date, findStateByPath, market }) => {
  console.log(`candidates before strategy filter: ${_.keys(candidates).length}`);
  // logCandidates(candidates);

  _.forOwn(candidates, (candidate) => {
    const ticker = _.get(candidate, 'ticker');

    const path = 'annual.DerivedDCF_IntrinsicValue_MAX_GROWTH_RATE_20_BY_MEAN';
    const margin = _.get(candidate[path], 'margin');
    _.set(candidate, `metrics.${path}`, margin);

    const stock = market.getStock(ticker);

    const grossProfitRate = getFundamentalGrowthRate(market, ticker, 'annual.FundamentalAccountingConcepts.GrossProfit', date);
    _.set(candidate, `metrics.grossProfitRate`, grossProfitRate);


    const revenuesRate = getFundamentalGrowthRate(market, ticker, 'annual.FundamentalAccountingConcepts.Revenues', date);
    _.set(candidate, `metrics.revenuesRate`, revenuesRate);

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
    _.set(candidate, `metrics.PE`, PE);


    let PB = _.get(candidate['annual.DerivedBookValuePerShare'], 'fact.res');
    if(_.isUndefined(PB)) {
      const state = findStateByPath('annual.DerivedBookValuePerShare', date, ticker);
      // PB = _.get(state, 'fact.res');

      const bookValuePerShare = _.get(state, 'fact.value');
      const price = _.get(state, 'entry.close');

      PB = price/bookValuePerShare;
    }
    // console.log('PB', PB);
    _.set(candidate, `metrics.PB`, PB);

    const Assets = getLastMetricValueByPath(market, ticker, 'annual.FundamentalAccountingConcepts.Assets', date);
    const Liabilities = getLastMetricValueByPath(market, ticker, 'annual.FundamentalAccountingConcepts.Liabilities', date);
    const CurrentRatio = Assets/Liabilities;
    _.set(candidate, `metrics.CurrentRatio`, CurrentRatio);


    const CurrentAssets = getLastMetricValueByPath(market, ticker, 'annual.FundamentalAccountingConcepts.CurrentAssets', date);
    const CurrentLiabilities = getLastMetricValueByPath(market, ticker, 'annual.FundamentalAccountingConcepts.CurrentLiabilities', date);
    const QuickRatio = CurrentAssets/CurrentLiabilities;
    _.set(candidate, `metrics.QuickRatio`, QuickRatio);


    const roaRate = getFundamentalGrowthRate(market, ticker, 'annual.FundamentalAccountingConcepts.ROA', date);
    // console.log('roaRate', roaRate);
    _.set(candidate, `metrics.roaRate`, roaRate);

    const roeRate = getFundamentalGrowthRate(market, ticker, 'annual.FundamentalAccountingConcepts.ROE', date);
    // console.log('roeRate', roeRate);
    _.set(candidate, `metrics.roeRate`, roeRate);


    // const earningsPerShareBasic = getFundamentalGrowthRate(market, ticker, 'annual.EarningsPerShareBasic', date);
    // const earningsPerShareDiluted = getFundamentalGrowthRate(market, ticker, 'annual.EarningsPerShareDiluted', date);
    // console.log('earningsPerShareBasic', earningsPerShareBasic);
    // console.log('earningsPerShareDiluted', earningsPerShareDiluted);

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

module.exports = {
  essentials,
}
