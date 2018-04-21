const _       = require('lodash');
const fs      = require('fs-extra');
const util    = require('../util.js');
const Promise = require('bluebird');

const StockService = require('../stock/service');
const Crawler      = require('./crawler');
const Stock        = require('./stock');

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

const crawlEntries = (millisecondsDelay = 1000) => {
  return findNextPageEntry()
    .then((options) => {
      if(options) {
        console.log(`crawl entry of sic ${options.sic} with offset ${_.get(options, 'entry.stats.start')}`);
        return crawlEntry(options.sic, options.entry)
          .then(() => { return true; });
      }

      return false;
    })
    .then((crawled) => {
      if(crawled) {
        return Promise.delay(millisecondsDelay)
          .then(() => crawlEntries())
      }
    })
};

const findNextPageEntry = () => {
  return getEntries()
    .then((entries) => {
      const sic = _.findKey(entries, (entry) => {
        return _.has(entry, 'stats') === false ||
               _.get(entry, 'stats.hasNextPage', false);
      });

      if(sic) {
        return {
          sic,
          entry: entries[sic],
        };
      }
    })
};

const crawlEntry = (sic, entry = {}) => {
  const params = {
    sic,
    count: _.get(entry, 'stats.count', 100),
    start: 0,
  };

  if(_.has(entry, 'stats.start')) {
    params.start = entry.stats.start + params.count;
  }

  return Crawler.crawlCompanyPageBySIC(params)
    .then((response) => {
      return saveListing(sic, _.get(response, 'stocks.entries', []))
        .then(() => { return response; })
    })
    .then((response) => {
      const stats = {
        count: params.count,
        start: params.start,
        hasNextPage: _.get(response, 'hasNextPage'),
      };

      return setCrawlResultsToEntry(sic, stats)
        .then(() => { return response; })
    })
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

const getStocksFromListings = () => {
  return getEntries()
    .then((entries) => {
      return _
        .chain(entries)
        .map((entry, sic) => {
          return require(`${LISTINGS_PATH}/${sic}.json`);
        })
        .flatten()
        .value();
    })
};

const crawlTitles = (millisecondsDelay = 1000) => {
  return findSicOfTitlelessEntry()
    .then((sic) => {
      if(_.isString(sic)) {
        console.log(`crawl title of sic ${sic}!`);
        return crawlTitle(sic)
          .then(() => { return true; });
      }

      return false;
    })
    .then((crawled) => {
      if(crawled) {
        return Promise.delay(millisecondsDelay)
          .then(() => crawlTitles())
      } else {
        console.log('All title crawled!');
      }
    })
};

const findSicOfTitlelessEntry = () => {
  return getEntries()
    .then((entries) => {
      return _.findKey(entries, (entry) => {
        return _.has(entry, 'title') === false;
      });
    })
};

const crawlTitle = (sic) => {
  return Crawler.crawlIndustryTitle(sic)
    .then((response) => {
      if(_.has(response, 'title')) {
        return saveTitleBySic(sic, response.title)
          .then(() => { return response; })
      }
    })
};

const saveTitleBySic = (sic, title) => {
  return getEntries()
    .then((entries) => {
      _.set(entries[sic], 'title', title);
      return entries;
    })
    .then((entries) => {
      return fs.writeJson(ENTRIES_PATH, entries);
    });
};

const getSicsOfSavedIndustryStockCrawls = () => {
  return util.getFiles(`${BASE_PATH}/stocks`)
    .then(files => _.map(files, file =>file.replace('.json', '')))
};

const getSicsOfUnsavedIndustryStockCrawls = () => {
  return getEntries()
    .then(_.keys)
    .then((sics) => {
      return getSicsOfSavedIndustryStockCrawls()
        .then((savedSics) => {
          return _.difference(sics, savedSics);
        })
    })
};

module.exports = {
  crawlEntry,
  crawlEntries,
  crawlTitles,
  extractSICsFromStocks,
  getEntries,
  getListing,
  getStocksFromListings,
  saveEntries,
  updateEntriesByStocks,
};
