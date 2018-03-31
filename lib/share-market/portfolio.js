const _ = require('lodash');

const removeByStake = (maxStake, shares, candidates) => {
  _.forEach(candidates, (candidate) => {
    const ticker = _.get(candidate, 'ticker');
    const share = shares[ticker];

    if(share && share.stake > maxStake) {
      delete candidates[ticker];
    }
  });

  return candidates;
};

const getMaxShareCount = (maxStake, share, netWealth) => {
  if(share.stake >= maxStake) {
    return 0;
  }

  const leftStake = maxStake - share.stake;
  const budget = leftStake * netWealth;

  if(share.price > 0) {
    return Math.floor(budget/share.price);
  }

  return 0;
};

module.exports = {
  getMaxShareCount,
  removeByStake,
};
