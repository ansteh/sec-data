const Analysis = require('./model.js');

const options = {
  tickers: ['GM'],
  metrics: [
    "summary.annual.EarningsPerShareDiluted",
    "summary.annual.EarningsPerShareBasicAndDiluted",
  ]
};

// Analysis.getMetrics(options)
//   .then(content => JSON.stringify(content, null, 2))
//   .then(console.log)
//   .catch(console.log);

Analysis.getEarnings(['GM'])
  .then(content => JSON.stringify(content, null, 2))
  .then(console.log)
  .catch(console.log);
