const _     = require('lodash');
const Audit = require('./model');

// Audit.getValuation()
//   // .then(_.last)
//   // .then(content => JSON.stringify(content, null, 2))
//   .then(console.log)
//   .catch(console.log);

Audit.getTransaction()
  // .then(transactions => _.filter(transactions, transaction => transaction.target_total_price >= 0))
  .then(transactions => _.filter(transactions, transaction => transaction.amount <= 0))
  // .then(content => JSON.stringify(content, null, 2))
  .then(console.log)
  .catch(console.log);
