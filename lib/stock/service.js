const fs = require('fs-extra');

const basePath = `${__dirname}/../../resources/stocks`;

const create = (stock) => {
  const pathname = `${basePath}/${stock.ticker}`;

  return ensureDirectories(stock.ticker)
    .then(() => {
      return fs.writeJson(`${pathname}/stock.json`, stock);
    });
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

const remove = (stock) => {
  return fs.remove(`${basePath}/${stock.ticker}`);
};

module.exports = {
  create,
  remove,
};
