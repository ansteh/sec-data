const fundamentals = require('../fundamentals');

const getTotalLiabilities = (filings) => {
  return fundamentals.get('Liabilities');
};

module.exports = {
  getTotalLiabilities,
};
