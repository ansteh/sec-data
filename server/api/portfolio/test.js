const _         = require('lodash');
const Portfolio = require('./controller.js');

Portfolio.getBy({ date: new Date(2018, 6, 27) })
  .then(stocks => _.filter(stocks, position => _.isEmpty(_.get(position, 'stock')) ))
  .then(result => JSON.stringify(result, null, 2))
  .then(console.log)
  .catch(console.log)
