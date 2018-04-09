const _       = require('lodash');
const Stock   = require('./index.js');

// Stock.createStocks('1000')
//   .then(console.log)
//   .catch(console.log)

Stock.getUnexploredStock('1000')
  .then(console.log)
  .catch(console.log)
