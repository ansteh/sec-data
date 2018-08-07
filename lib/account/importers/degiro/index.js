const _     = require('lodash');
const fs    = require('fs');
const parse = require('csv-parse/lib/sync');

const { loadFileContent } = require('../../../util.js');

const getMappings = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(`${__dirname}/resources/mapping.json`, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          resolve(JSON.parse(data));
        } catch(err) {
          reject(err);
        }
      }
    });
  });
};

const preparePortfolio = (entries) => {
  return getMappings()
    .then((mappings) => {
      return _.map(entries, (entry) => {
        return {
          title: _.get(entry, 'Produkt'),
          ticker: _.findKey(mappings, value => value === _.get(entry, 'Produkt')),
          ISIN: _.get(entry, 'Symbol/ISIN'),
          amount: parseInt(_.get(entry, 'Anzahl', 0)),
          currency: _.get(entry, 'Wert'),
        };
      });
    })
};

const test = (file, prepare) => {
  loadFileContent(`${__dirname}/resources/${file}`)
    .then((content) => {
      const records = parse(content, { columns: true });
      return records;
    })
    .then((entries) => {
      return prepare ? prepare(entries) : entries;
    })
    .then(console.log)
    .catch(console.log);
};

// test('Account.csv');
test('Portfolio.csv', preparePortfolio);
// test('Transactions.csv');
