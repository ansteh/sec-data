const fundamentals = require('../fundamentals');

const getTotalAssets = (filings) => {
  return fundamentals.get(filings, 'Assets');
};

module.exports = {
  getTotalAssets,
};
