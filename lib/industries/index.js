const _       = require('lodash');
const fs      = require('fs-extra');
const util    = require('../util.js');
const Promise = require('bluebird');

const StockService = require('../stock/service');

const basePath = `${__dirname}/../../resources/industries`;
const entriesPath = `${basePath}/entries.json`;

const extractSICsFromStocks = () => {
  return StockService.getStocksFromResources()
    .then((stocks) => {
      return _
        .chain(stocks)
        .map('sic')
        .uniq()
        .filter(_.isString)
        .filter(x => _.isNaN(parseInt(x)) === false)
        .sortBy()
        .value();
    })
};

const ensureDirectory = () => {
  const pathname = basePath;

  return fs.pathExists(pathname)
    .then((exists) => {
      if(exists === false) {
        return fs.ensureDir(pathname);
      }
    });
};

const getEntries = () => {
  return fs.readJson(entriesPath);
};

const saveEntries = (sics) => {
  return ensureDirectory()
    .then(() => {
      return getEntries().catch(() => { return {}; })
    })
    .then((currentEntries) => {
      const entries = _.map(sics, (sic) => {
        const entry = {};
        entry[sic] = {};

        return entry;
      });

      return _.assign(...entries, currentEntries);
    })
    .then((entries) => {
      return fs.writeJson(entriesPath, entries);
    });
};

const updateEntriesByStocks = () => {
  return extractSICsFromStocks()
    .then(saveEntries)
};

module.exports = {
  extractSICsFromStocks,
  saveEntries,
  updateEntriesByStocks,
};
