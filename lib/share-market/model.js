const _ = require('lodash');

const findByFormat = _.curry((market, ticker, date) => {
  const stock = _.get(market, ticker);
  return stock.historical.findByFormat(date);
});

const create = (market) => {

  return {
    findByFormat: findByFormat(market),
  };
};

module.exports = {
  create,
};
