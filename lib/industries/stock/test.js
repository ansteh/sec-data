const _       = require('lodash');
const Stock   = require('./index.js');

// Stock.createStocks('1000')
//   .then(console.log)
//   .catch(console.log)

Stock.crawlUnexploredStock('1000')
  .then(content => JSON.stringify(content, null, 2))
  .then(console.log)
  .catch(console.log)
