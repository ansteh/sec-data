const Stock = require('./index.js');

const GM = {
  ticker: 'GM',
  name: 'General Motors Co',
  cik: '0001467858',
  search: {}
};

// Stock.remove(GM)
//   .then(() => Stock.create(GM));

Stock.crawlAnnualFilings('GM')
  .then(console.log)
  .catch(console.log);
