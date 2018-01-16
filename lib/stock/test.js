const Stock   = require('./index.js');
const Service = require('./service.js');
const Filing  = require('../filing');

const GM = {
  ticker: 'GM',
  name: 'General Motors Co',
  cik: '0001467858',
  search: {}
};

Stock.findAllStocksWithUnparsedFilings()
  // .then(stocks => stocks.length)
  .then(console.log)
  .catch(console.log);

// Stock.findStockWithUnparsedFilings()
//   .then(console.log)
//   .catch(console.log);

// Stock.getStocksMissingFilingEntries()
//   .then(console.log)
//   .catch(console.log);

// Stock.updateMissingStockFilings();
// Stock.downloadMissingFilingFilesBy();

// Stock.downloadMissingInteractiveFilingsBy('GME')
//   .then(console.log)
//   .catch(console.log);

// Service.getUndownloadedFilings('GME')
//   .then(console.log)
//   .catch(console.log);

// Stock.updateQuarterlyFilings('GME')
//   .then(console.log)
//   .catch(console.log);

// Stock.crawlMissingQuarterlyFilings('GME')
//   .then(content => console.log(JSON.stringify(content, null, 2)))
//   .catch(console.log);

// Stock.crawlQuarterlyFilingsByQueryParams('GME')
//   .then(content => console.log(JSON.stringify(content, null, 2)))
//   .catch(console.log);

// Stock.crawlQuarterlyFilings('GME')
//   .then(content => console.log(JSON.stringify(content, null, 2)))
//   .catch(console.log);

// Stock.remove(GM)
//   .then(() => Stock.create(GM));

// Stock.crawlAnnualFilings('GM')
//   .then(console.log)
//   .catch(console.log);

// const testCreateStock = (stock) => {
//   Stock.remove(stock)
//     .then(() => Stock.crawlStock(stock))
//     .then(console.log)
//     .catch(console.log);
// };

// testCreateStock(GM);

// createStock(GM)
//   .then(console.log)
//   .catch(console.log);

// Stock.remove(GM)
//   .then(() => Stock.create(GM));

// Stock.crawlAnnualFilings('GM')
//   .then(console.log)
//   .catch(console.log);

// Stock.downloadAnnualFiles('GM')
//   .then(console.log)
//   .catch(console.log);

// Stock.parseFilingFilesByTicker('GM')
//   .then(console.log)
//   .catch(console.log);
