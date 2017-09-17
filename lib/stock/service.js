const fs      = require('fs-extra');
const util    = require('../util.js');

const basePath = `${__dirname}/../../resources/stocks`;

const create = (stock) => {
  return ensureDirectories(stock.ticker)
    .then(() => save(stock));
};

const ensureDirectories = (ticker) => {
  const pathname = `${basePath}/${ticker}`;

  return fs.pathExists(pathname)
    .then((exists) => {
      if(exists === false) {
        return fs.ensureDir(pathname)
          .then(() => fs.ensureDir(`${pathname}/filings`))
          .then(() => fs.ensureDir(`${pathname}/files`))
      }
    });
};

const getStockFilepath = (ticker) => {
  return `${basePath}/${ticker}/stock.json`;
};

const save = (stock) => {
  const filepath = getStockFilepath(stock.ticker);
  return fs.writeJson(filepath, stock);
};

const remove = (stock) => {
  return fs.remove(`${basePath}/${stock.ticker}`);
};

const findStockByTicker = (ticker) => {
  const filepath = getStockFilepath(ticker);
  return fs.readJson(filepath);
};

const hasEmptyFilings = (ticker) => {
  return util.getFiles(`${basePath}/${ticker}/filings`)
    .then((files) => {
      return files.length === 0;
    })
    .catch((err) => {
      if(err.code === 'ENOENT') {
        return false;
      }
    });
};

module.exports = {
  create,
  findStockByTicker,
  hasEmptyFilings,
  remove,
  save,
};
