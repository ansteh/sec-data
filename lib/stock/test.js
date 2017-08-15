const Stock   = require('./index.js');
const Filing  = require('../filing');

const GM = {
  ticker: 'GM',
  name: 'General Motors Co',
  cik: '0001467858',
  search: {}
};

// Stock.remove(GM)
//   .then(() => Stock.create(GM));

// Stock.crawlAnnualFilings('GM')
//   .then(console.log)
//   .catch(console.log);

const testCreateStock = (stock) => {
  Stock.remove(stock)
    .then(() => Stock.crawlStock(stock))
    .then(console.log)
    .catch(console.log);
};

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
