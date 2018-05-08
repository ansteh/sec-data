const _            = require('lodash');
const Stock        = require('./index.js');
const Candidates   = require('./candidates.js');

const sic = '1531';

// Stock.createStocks(sic)
//   .then(console.log)
//   .catch(console.log)

// Stock.crawlUnexploredStock(sic)
//   .then(content => JSON.stringify(content, null, 2))
//   .then(console.log)
//   .catch(console.log)

// Stock.getStats(sic)
//   .then(console.log)
//   .catch(console.log)

// Stock.filterInteractiveStocks('1000', 5)
//   .then(content => content.length)
//   .then(console.log)
//   .catch(console.log)

// Candidates.createCandidates()
//   .then(console.log)
//   .catch(console.log)

// Candidates.findCandidateWithoutTicker()
//   .then(console.log)
//   .catch(console.log)

// const candidate = { cik: '0000764065', ticker: 'CLF' };
// Candidates.updateStock(candidate)
//   .then(console.log)
//   .catch(console.log)

// Candidates.getCandidates()
//   .then(_.values)
//   .then(_.first)
//   .then(console.log)
//   .catch(console.log)
