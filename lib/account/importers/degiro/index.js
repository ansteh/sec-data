const parse = require('csv-parse/lib/sync');
const { loadFileContent } = require('../../../util.js');

const test = (file) => {
  loadFileContent(`${__dirname}/resources/${file}`)
    .then((content) => {
      const records = parse(content, { columns: true });
      return records;
    })
    .then(console.log)
    .catch(console.log);
}

test('Account.csv');
// test('Portfolio.csv');
// test('Transactions.csv');
