const _              = require('lodash');
const Stock          = require('./controller');

Stock.getHistoricals('AAPL')
  // .then(series => _.filter(series, entry => _.isString(entry.date)))
  // .then(series => series.length)
  .then(series => _.slice(series, series.length - 10))
  .then(console.log)
  .catch(console.log);
