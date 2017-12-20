const _ = require('lodash');

const filterCandidatesForBuying = (candidates, { date, findStateByPath }) => {
  console.log(`candidates before strategy filter: ${_.keys(candidates).length}`);

  _.forOwn(candidates, (candidate) => {
    const ticker = _.get(candidate, 'ticker');

    let PE = _.get(candidate['annual.EarningsPerShareDiluted'], 'fact.res');
    if(_.isUndefined(PE)) {
      const state = findStateByPath('annual.EarningsPerShareDiluted', date, ticker);
      PE = _.get(state, 'fact.res');
    }
    // console.log('PE', PE);

    if(PE < 2 || PE > 15) {
      delete candidates[ticker];
      return;
    }

    let PB = _.get(candidate['annual.DerivedBookValuePerShare'], 'fact.res');
    if(_.isUndefined(PB)) {
      const state = findStateByPath('annual.DerivedBookValuePerShare', date, ticker);
      PB = _.get(state, 'fact.res');
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
