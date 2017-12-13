const _ = require('lodash');

const filterCandidatesForBuying = (candidates) => {
  console.log(`candidates before strategy filter: ${_.keys(candidates).length}`);

  _.forOwn(candidates, (candidate) => {
    const ticker = _.get(candidate, 'ticker');

    const PE = _.get(candidate['annual.EarningsPerShareDiluted'], 'fact.res');

    if(PE < 2 || PE > 15) {
      delete candidates[ticker];
    }

    const PB = _.get(candidate['annual.DerivedBookValuePerShare'], 'fact.res');

    if(PB < 0.5 || PB > 1.5) {
      delete candidates[ticker];
    }

    // const rate = _.get(candidate['annual.FundamentalAccountingConcepts.NetIncomeLoss'], 'fact');
    const rate = _.get(candidate['annual.FundamentalAccountingConcepts.NetCashFlow'], 'fact');

    if(!rate || (_.isNumber(rate) && rate < 0.07)) {
      delete candidates[ticker];
    }
  });

  return candidates;
};

module.exports = {
  filterCandidatesForBuying
}
