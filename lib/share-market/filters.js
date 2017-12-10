const _ = require('lodash');

const filterCandidatesForBuying = (candidates) => {
  console.log(`candidates before strategy filter: ${_.keys(candidates).length}`);

  _.forOwn(candidates, (candidate) => {
    const PE = _.get(candidate['annual.EarningsPerShareDiluted'], 'fact.res');

    if(PE < 2 || PE > 15) {
      const ticker = _.get(candidate, 'ticker');
      delete candidates[ticker];
    }

    const PB = _.get(candidate['annual.DerivedBookValuePerShare'], 'fact.res');

    if(PB < 0.5 || PB > 1.5) {
      const ticker = _.get(candidate, 'ticker');
      delete candidates[ticker];
    }

    const assets = _.get(candidate['annual.FundamentalAccountingConcepts.Assets'], 'fact');

    // console.log(assets);
  });

  return candidates;
};

module.exports = {
  filterCandidatesForBuying
}
