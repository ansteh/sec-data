const fs        = require('fs');

const Stock = require('./lib/stock');

const GM = {
  ticker: 'GM',
  name: 'General Motors Co',
  cik: '0001467858',
  filings: {}
};

// Stock.remove(GM)
//   .then(() => Stock.create(GM));

// Stock.crawlAnnualFilings('GM')
//   .then(console.log)
//   .catch(console.log);

// Stock.downloadAnnualFiles('GM')
//   .then(console.log)
//   .catch(console.log);
