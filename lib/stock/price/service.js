const fs      = require('fs-extra');
const _       = require('lodash');

const basePath = `${__dirname}/../../../resources/stocks`;

const getPathToHistorical = (ticker) => {
  return `${basePath}/${ticker}/historical-price.json`
};

const get = (ticker) => {
  const filepath = getPathToHistorical(ticker);
  return fs.readJson(filepath);
};

const getAll = (tickers) => {
  if(_.isString(tickers)) {
    tickers = [tickers];
  }

  const historicals = tickers.map((ticker) => {
    const filepath = getPathToHistorical(ticker);

    return fs.readJson(filepath)
      .then((historical) => {
        return { ticker, historical };
      });
  });

  return Promise.all(historicals)
    .then((historicals) => {
      return _.keyBy(historicals, 'ticker');
    });
};

const save = (ticker, historical) => {
  const filepath = getPathToHistorical(ticker);
  return fs.writeJson(filepath, historical);
};

module.exports = {
  getPathToHistorical,
  get,
  getAll,
  save,
}
