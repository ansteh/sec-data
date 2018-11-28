const Historicals = require('./index.js');

Historicals.updateAll()
  .catch(console.log);

// Historicals.removeDateStringsFromHistoricals({ ticker: 'AAPL' })
//   .then(console.log)
//   .catch(console.log);

// Historicals.removeDateStringsFromHistoricalsOfAllTickers()
//   .then(console.log)
//   .catch(console.log);

// Historicals.removeDuplicatesFromHistoricalsOfAllTickers()
//   .then(console.log)
//   .catch(console.log);

// Historicals.removeDuplicatesFromHistoricals('AAPL')
//   .then(console.log)
//   .catch(console.log);
