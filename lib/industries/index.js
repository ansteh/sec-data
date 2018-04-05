const _       = require('lodash');
const fs      = require('fs-extra');
const util    = require('../util.js');
const Promise = require('bluebird');

const StockService = require('../stock/service');
const Crawler      = require('./crawler');

const BASE_PATH = `${__dirname}/../../resources/industries`;
const ENTRIES_PATH = `${BASE_PATH}/entries.json`;
const LISTINGS_PATH = `${BASE_PATH}/listings`;

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

const ensureDirectory = (pathname) => {
  return fs.pathExists(pathname)
    .then((exists) => {
      if(exists === false) {
        return fs.ensureDir(pathname);
      }
    });
};

const getEntries = () => {
  return fs.readJson(ENTRIES_PATH);
};

const saveEntries = (sics) => {
  return ensureDirectory(BASE_PATH)
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
      return fs.writeJson(ENTRIES_PATH, entries);
    });
};

const updateEntriesByStocks = () => {
  return extractSICsFromStocks()
    .then(saveEntries)
};

const getListing = (sic) => {
  return fs.readJson(`${LISTINGS_PATH}/${sic}.json`);
};

const saveListing = (sic, listing = []) => {
  return ensureDirectory(LISTINGS_PATH)
    .then(() => {
      return getListing(sic).catch(() => { return []; });
    })
    .then((currentListing) => {
      return fs.writeJson(`${LISTINGS_PATH}/${sic}.json`, [...currentListing , ...listing]);
    });
};

const setCrawlResultsToEntry = (sic, stats) => {
  return ensureDirectory(BASE_PATH)
    .then(() => {
      return getEntries().catch(() => { return {}; })
    })
    .then((entries) => {
      const entry = entries[sic];
      _.set(entry, 'stats', stats);
      return entries;
    })
    .then((entries) => {
      return fs.writeJson(ENTRIES_PATH, entries);
    });
};

const crawlEntry = (sic, entry = {}) => {
  const params = { sic, start: _.get(entry, 'stats.start', 0) };

  return Crawler.crawlCompanyPageBySIC(params)
    .then((response) => {
      return saveListing(sic, _.get(response, 'stocks.entries', []))
        .then(() => { return response; })
    })
    .then((response) => {
      const stats = {
        start: params.start,
        hasNextPage: _.get(response, 'hasNextPage'),
      };

      return setCrawlResultsToEntry(sic, stats)
        .then(() => { return response; })
    })
};

module.exports = {
  crawlEntry,
  extractSICsFromStocks,
  saveEntries,
  updateEntriesByStocks,
};
