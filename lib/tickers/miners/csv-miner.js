const _ = require('lodash');

const util  = require('../../util.js');
const parse = require('csv-parse');

const Formats = require('./../formats');

const EXTERNALS_PATH = `${__dirname}/../../../resources/tickers/externals`;

const getStocks = async () => {
  const files = await getFiles();  
  const stocks = await Promise.all(files.map(getMetadata));
  
  return _
    .chain(stocks)
    .flatten()
    .uniqBy('ticker')
    .filter(stock => stock.ticker)
    .sortBy('ticker')
    .value();
};

const getFiles = async () => {
  const files = await util.getFiles(EXTERNALS_PATH);
  return files.filter(name => /.csv$/.test(name));
};

const getMetadata = async (filename) => {
  const rows = await getCsv(`${EXTERNALS_PATH}/${filename}`);
  
  return rows.map((row) => {
    return {
      ticker: Formats.getSecTicker(row['Full Ticker']),
    };
  });
};

const getCsv = (filepath) => {
  return util.loadFileContent(filepath)
    .then(parseCSV);
};

const parseCSV = (text) => {
  return new Promise((resolve, reject) => {
    parse(text, { columns: true }, (err, output) => {
      if(err) {
        reject(err);
      } else {
        resolve(output);
      };
    });
  });
};

module.exports = {
  getStocks,
};

// getMetadata('durable earnings - fast - 2021-04-27.csv')
//   .then(console.log)
//   .catch(console.log)
//   .finally(() => { process.exit(); });
  
// getStocks()
//   .then(console.log)
//   .catch(console.log)
//   .finally(() => { process.exit(); });