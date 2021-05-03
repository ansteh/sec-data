const _ = require('lodash');

const MINERS = [
  require('./csv-miner'),
];

const getStocks = async () => {
  const buckets = await Promise.all(MINERS.map(miner => miner.getStocks()));
  
  return _
    .chain(buckets)
    .flatten()
    .uniqBy('ticker')
    .filter(stock => stock.ticker)
    .sortBy('ticker')
    .value();
};

module.exports = {
  getStocks,
};

// getStocks()
//   .then(console.log)
//   .catch(console.log)
//   .finally(() => { process.exit(); });