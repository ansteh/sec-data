const _ = require('lodash');

const fundamentals  = require('../fundamentals/metrics');
const growthRate    = require('../modules/timeseries/growthRate.js');
const take          = require('../modules/timeseries/take.js');

// FundamentalAccountingConcepts.Revenues
// FundamentalAccountingConcepts.GrossProfit

const filterCandidatesForBuying = (candidates, { date, findStateByPath, market }) => {
  console.log(`candidates before strategy filter: ${_.keys(candidates).length}`);

  _.forOwn(candidates, (candidate) => {
    const ticker = _.get(candidate, 'ticker');
    const stock = market.getStock(ticker);

    // const grossProfitSeries = market.getFundamentals(ticker, 'annual.FundamentalAccountingConcepts.GrossProfit');
    // const grossProfit = take(grossProfitSeries, 'endDate', date);
    // console.log('GrossProfit', grossProfit);

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

module.exports = {
  filterCandidatesForBuying
}
