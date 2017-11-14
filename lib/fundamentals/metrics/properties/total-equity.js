const _ = require('lodash');
const fundamentals = require('../fundamentals');

const { getTotalAssets } = require('./total-assets');
const { getTotalLiabilities } = require('./total-liabilities');

const getTotalEquity = (filings) => {
  const totalAssets = getTotalAssets(filings);
  const totalLiabilities = getTotalLiabilities(filings);

  return _.map(totalAssets, ({ Assets, DocumentPeriodEndDate }, index) => {
    const { Liabilities } = totalLiabilities[index];

    return {
      TotalEquity: Assets - Liabilities,
      DocumentPeriodEndDate
    };
  })
};

module.exports = {
  getTotalEquity,
};
