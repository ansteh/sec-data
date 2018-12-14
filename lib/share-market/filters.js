const _ = require('lodash');

const fundamentals  = require('../fundamentals/metrics');
const growthRate    = require('../modules/timeseries/growthRate.js');
const take          = require('../modules/timeseries/take.js');

const Summary = require('../stock/summary/model.js');

const { getEarnings } = require('../fundamentals/metrics/util.js');

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

const filterCandidatesForBuying = (candidates, { date, findStateByPath, market }) => {
  // console.log(`candidates before strategy filter: ${_.keys(candidates).length}`);
  // logCandidates(candidates);

  const toRemove = [];
  const score = {};

  _.forOwn(candidates, (candidate) => {
    const ticker = _.get(candidate, 'ticker');
    score[ticker] = 0;

    // const path = 'annual.DerivedDCF_IntrinsicValue_MAX_GROWTH_RATE_20_BY_MEAN';
    // const margin = _.get(candidate[path], 'margin');
    //
    // if(!margin || margin < 0) {
    //   toRemove.push(ticker);
    //   return;
    // }

    const stock = market.getStock(ticker);

    const grossProfitRate = getFundamentalGrowthRate(market, ticker, 'annual.FundamentalAccountingConcepts.GrossProfit', date);
    if(!grossProfitRate || _.isNaN(grossProfitRate) || grossProfitRate < 0.07) {
      toRemove.push(ticker);
      return;
    }

    score[ticker] += 1;

    const revenuesRate = getFundamentalGrowthRate(market, ticker, 'annual.FundamentalAccountingConcepts.Revenues', date);
    if(!revenuesRate || _.isNaN(revenuesRate) || revenuesRate < 0.07) {
      toRemove.push(ticker);
      return;
    }

    score[ticker] += 1;

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

    if(!PE || PE < 1 || PE > 15) {
      toRemove.push(ticker);
      return;
    }
    score[ticker] += 1;

    let PB = _.get(candidate['annual.DerivedBookValuePerShare'], 'fact.res');
    if(_.isUndefined(PB)) {
      const state = findStateByPath('annual.DerivedBookValuePerShare', date, ticker);
      // PB = _.get(state, 'fact.res');

      const bookValuePerShare = _.get(state, 'fact.value');
      const price = _.get(state, 'entry.close');

      PB = price/bookValuePerShare;
    }
    // console.log('PB', PB);

    if(!PB || PB < 0.5 || PB > 1.5) {
      toRemove.push(ticker);
      return;
    }
    score[ticker] += 1;

    const Assets = getLastMetricValueByPath(market, ticker, 'annual.FundamentalAccountingConcepts.Assets', date);
    const Liabilities = getLastMetricValueByPath(market, ticker, 'annual.FundamentalAccountingConcepts.Liabilities', date);
    const CurrentRatio = Assets/Liabilities;
    if(!CurrentRatio || CurrentRatio < 1.5) {
      toRemove.push(ticker);
      return;
    }
    score[ticker] += 1;

    const CurrentAssets = getLastMetricValueByPath(market, ticker, 'annual.FundamentalAccountingConcepts.CurrentAssets', date);
    const CurrentLiabilities = getLastMetricValueByPath(market, ticker, 'annual.FundamentalAccountingConcepts.CurrentLiabilities', date);
    const QuickRatio = CurrentAssets/CurrentLiabilities;
    if(!QuickRatio || QuickRatio < 1.5) {
      toRemove.push(ticker);
      return;
    }
    score[ticker] += 1;

    const roaRate = getFundamentalGrowthRate(market, ticker, 'annual.FundamentalAccountingConcepts.ROA', date);
    // console.log('roaRate', roaRate);
    if(!roaRate || roaRate < 0.07) {
      toRemove.push(ticker);
      return;
    }
    score[ticker] += 1;

    const roeRate = getFundamentalGrowthRate(market, ticker, 'annual.FundamentalAccountingConcepts.ROE', date);
    // console.log('roeRate', roeRate);
    if(!roeRate || roeRate < 0.07) {
      toRemove.push(ticker);
      return;
    }
    score[ticker] += 1;

    const earningsPerShareBasic = getFundamentalGrowthRate(market, ticker, 'annual.EarningsPerShareBasic', date);
    const earningsPerShareDiluted = getFundamentalGrowthRate(market, ticker, 'annual.EarningsPerShareDiluted', date);
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

  // _.forEach(toRemove, (ticker) => {
  //   delete candidates[ticker];
  // });

  const maxScore = _.max(_.values(score));
  const tickers = _
    .chain(score)
    .pickBy(value => value === maxScore)
    .keys()
    .value();

  return _.filter(candidates, ({ ticker }) => {
    return _.includes(tickers, ticker);
  });
};

const filterCandidates = (candidates, { date, findStateByPath, market }) => {
  // console.log(`candidates before strategy filter: ${_.keys(candidates).length}`);

  _.forOwn(candidates, (candidate) => {
    const ticker = _.get(candidate, 'ticker');

    const path = 'annual.DerivedDCF_IntrinsicValue_MAX_GROWTH_RATE_20_BY_MEAN';
    const margin = _.get(candidate[path], 'margin');

    if(!margin || margin < 0) {
      delete candidates[ticker];
      return;
    }

    const EarningsPerShareDiluted = sliceMetricByPath(market, ticker, 'annual.EarningsPerShareDiluted', date);
    if(_.isArray(EarningsPerShareDiluted) === false || EarningsPerShareDiluted.length < 6) {
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
    _.set(candidate, 'params.profit%', grossProfitRate);


    const revenuesRate = getFundamentalGrowthRate(market, ticker, 'annual.FundamentalAccountingConcepts.Revenues', date);
    // if(_.isNaN(revenuesRate) || revenuesRate < 0.07) {
    //   delete candidates[ticker];
    //   return;
    // }
    _.set(candidate, 'params.revenues%', revenuesRate);

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

    // if(PE < 1 || PE > 15) {
    //   delete candidates[ticker];
    //   return;
    // }
    _.set(candidate, 'params.PE', PE);

    let PB = _.get(candidate['annual.DerivedBookValuePerShare'], 'fact.res');
    if(_.isUndefined(PB)) {
      const state = findStateByPath('annual.DerivedBookValuePerShare', date, ticker);
      // PB = _.get(state, 'fact.res');

      const fact = _.last(sliceMetricByPath(market, ticker, 'annual.DerivedBookValuePerShare', date));
      const bookValuePerShare = _.get(fact, 'value');
      // _.set(candidate, 'params.BookValuePerShare', bookValuePerShare);
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

    // setToParamsToCandidate(candidate, 'NetCashFlow', market, ticker, 'annual.FundamentalAccountingConcepts.NetCashFlow', date);
    const netCashFlowRate = getFundamentalGrowthRate(market, ticker, 'annual.FundamentalAccountingConcepts.NetCashFlow', date);
    _.set(candidate, `params.NetCash%`, netCashFlowRate);

    setToParamsToCandidate(candidate, 'ROA', market, ticker, 'annual.FundamentalAccountingConcepts.ROA', date);
    setToParamsToCandidate(candidate, 'ROE', market, ticker, 'annual.FundamentalAccountingConcepts.ROE', date);

    const Assets = getLastMetricValueByPath(market, ticker, 'annual.FundamentalAccountingConcepts.Assets', date);
    const Liabilities = getLastMetricValueByPath(market, ticker, 'annual.FundamentalAccountingConcepts.Liabilities', date);
    const CurrentRatio = Assets/Liabilities;
    _.set(candidate, 'params.CurrentRatio', CurrentRatio);

    const CurrentAssets = getLastMetricValueByPath(market, ticker, 'annual.FundamentalAccountingConcepts.CurrentAssets', date);
    const CurrentLiabilities = getLastMetricValueByPath(market, ticker, 'annual.FundamentalAccountingConcepts.CurrentLiabilities', date);
    const QuickRatio = CurrentAssets/CurrentLiabilities;
    _.set(candidate, 'params.QuickRatio', QuickRatio);
  });

  return candidates;
};

module.exports = {
  filterCandidatesForBuying,
  filterCandidates,
}
