const _ = require('lodash');

const getSecTicker = ticker => _.last((ticker || '').trim().split(':'))
  .toUpperCase();
  
module.exports = {
  getSecTicker,
};