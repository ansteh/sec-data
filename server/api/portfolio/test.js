const _         = require('lodash');
const Portfolio = require('./controller.js');

Portfolio.getBy({ date: new Date(2018, 7, 13) })
  // .then(portfolio => _.filter(portfolio.positions, position => _.isEmpty(_.get(position, 'stock')) ))
  // .then(portfolio => _.filter(portfolio.positions, p => p.marginOfSafetyPortfolioWeight === 0).length)
  .then(result => JSON.stringify(result, null, 2))
  .then(console.log)
  .catch(console.log)
