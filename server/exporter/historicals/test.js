const Historicals = require('./index.js');

Historicals.updateAll()
  .catch(console.log);

// Historicals.removeDateStringsFromHistoricalsOfAllTickers()
//   .then(console.log)
//   .catch(console.log);

// Historicals.removeDateStringsFromHistoricals({ ticker: 'AAPL' })
//   .then(console.log)
//   .catch(console.log);
