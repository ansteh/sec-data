const _       = require('lodash');
const fs      = require('fs-extra');
const Promise = require('bluebird');

const Crawler      = require('./crawler.js');

const BASE_PATH = `${__dirname}/../../../resources/wallux`;
const ENTREPRISES_PATH = `${BASE_PATH}/entreprises`;
const CATEGORIES_PATH = `${BASE_PATH}/categories.json`;

const ensureDirectory = (pathname) => {
  return fs.pathExists(pathname)
    .then((exists) => {
      if(exists === false) {
        return fs.ensureDir(pathname);
      }
    });
};

const getCategories = () => {
  return fs.readJson(CATEGORIES_PATH)
    .catch(() => { return {}; });
};

const saveCategories = (categories) => {
  return ensureDirectory(BASE_PATH)
    .then(() => {
      return getCategories()
    })
    .then((currentEntries) => {
      const entries = _.map(categories, (category) => {
        const entry = {};
        entry[category.name] = category;

        return entry;
      });

      return _.assign(...entries, currentEntries);
    })
    .then((entries) => {
      return fs.writeJson(CATEGORIES_PATH, entries);
    });
};

const crawlCategories = (url) => {
  return Crawler.getCategories(url)
    .then(saveCategories)
};

const crawlListings = () => {
  return getCategoryWithoutListing()
    .then((category) => {
      if(category) {
        return crawlListingByCategory(category)
          .then(() => { return true; });
      }

      return false;
    })
    .then((crawled) => {
      if(crawled) {
        return Promise.delay(1000)
          .then(() => crawlListings())
      }
    })
};

const getCategoryWithoutListing = () => {
  return getCategories()
    .then((categories) => {
      return _.find(_.values(categories), (category) => {
        return _.has(category, 'listing') === false;
      });
    });
};

const crawlListingByCategory = (category) => {
  return Crawler.getListing(`https://wallux.com${category.href}`)
    .then(listing => saveListingByCategory(category, listing))
};

const saveListingByCategory = (category, listing) => {
  return getCategories()
    .then((categories) => {
      _.set(categories[category.name], 'listing', listing);
      return fs.writeJson(CATEGORIES_PATH, categories);
    });
};

module.exports = {
  crawlCategories,
  crawlListings,
  getCategories,
};
