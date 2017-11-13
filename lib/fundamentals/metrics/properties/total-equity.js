const _ = require('lodash');
const fundamentals = require('../fundamentals');

const { getTotalAssets } = require('./total-assets');
const { getTotalLiabilities } = require('./total-liabilities');

const getTotalEquity = (filings) => {
  const assets = getTotalAssets(filings);
  const liabilities = getTotalAssets(filings);

};

module.exports = {
  getTotalEquity,
};
