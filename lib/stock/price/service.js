const fs      = require('fs-extra');

const basePath = `${__dirname}/../../../resources/stocks`;

const getPathToHistorical = (ticker) => {
  return `${basePath}/${ticker}/historical-price.json`
};

const get = (ticker) => {
  const filepath = getPathToHistorical(ticker);
  return fs.readJson(filepath);
};

const save = (ticker, historical) => {
  const filepath = getPathToHistorical(ticker);
  return fs.writeJson(filepath, historical);
};

module.exports = {
  getPathToHistorical,
  get,
  save,
}
