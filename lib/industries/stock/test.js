const _       = require('lodash');
const Stock   = require('./index.js');

const sic = '1531';

// Stock.createStocks(sic)
//   .then(console.log)
//   .catch(console.log)

Stock.crawlUnexploredStock(sic)
  .then(content => JSON.stringify(content, null, 2))
  .then(console.log)
  .catch(console.log)

// Stock.getStats(sic)
//   .then(console.log)
//   .catch(console.log)
