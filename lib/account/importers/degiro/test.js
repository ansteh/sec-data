const Degiro = require('./index.js');

// test('Account.csv');
// Degiro.test('Portfolio.csv', Degiro.preparePortfolio);
// test('Transactions.csv');

Degiro.getPortfolio()
  .then(console.log)
  .catch(console.log)
