const _       = require('lodash');
const Industries = require('./index.js');

// Industries.extractSICsFromStocks()
//   .then(console.log)
//   .catch(console.log)

// Industries.updateEntriesByStocks()
//   .then(console.log)
//   .catch(console.log)

// Industries.crawlEntry('1000')
//   .then(console.log)
//   .catch(console.log)

// Industries.crawlEntries()
//   .then(console.log)
//   .catch(console.log)

// Industries.getStocksFromListings()
//   .then((stocks) => {
//     return _
//       .chain(stocks)
//       .uniqBy('cik')
//       .value();
//   })
//   .then(console.log)
//   .catch(console.log)

// Industries.crawlTitles()
//   .catch(console.log)

// Industries.getEntries()
//   .then((entries) => {
//     console.log(entries);
//     return _
//       .chain(entries)
//       .values()
//       .map('title')
//       .uniq()
//       .sortBy()
//       .value();
//   })
//   .then(console.log)
//   .catch(console.log)


// Industries.getSicsOfSavedIndustryStockCrawls()
// .then(console.log)
// .catch(console.log)
//
// Industries.getSicsOfUnsavedIndustryStockCrawls()
// .then(console.log)
// .catch(console.log)

// Industries.createNextStocks()
//   .then(console.log)
//   .catch(console.log)

Industries.crawlUnexploredStocks()
.then(console.log)
.catch(console.log)
