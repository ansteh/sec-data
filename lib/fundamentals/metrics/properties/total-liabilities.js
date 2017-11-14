const fundamentals = require('../fundamentals');

const getTotalLiabilities = (filings) => {
  return fundamentals.get(filings, 'Liabilities');
};

module.exports = {
  getTotalLiabilities,
};
