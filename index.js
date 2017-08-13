const fs        = require('fs');

// const saveEaxmple = () => {
//   let sourceUrl = 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001467858&type=10-K&dateb=&owner=include&count=40';
//   got.stream(sourceUrl).pipe(fs.createWriteStream(`${__dirname}/resources/example.html`));
// };

const Stock = require('./lib/stock');

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
