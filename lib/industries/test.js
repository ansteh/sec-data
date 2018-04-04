const Industries = require('./index.js');

// Industries.extractSICsFromStocks()
//   .then(console.log)
//   .catch(console.log)

Industries.updateEntriesByStocks()
  .then(console.log)
  .catch(console.log)
