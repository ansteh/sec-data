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

const crawlContacts = () => {
  return getCompanyWithoutContact()
    .then((options) => {
      if(_.has(options, 'category')) {
        console.log(`Get contacts of ${options.company.name}`);
        return crawlContact(options.category, options.company)
          .then(() => { return true; });
      }

      return false;
    })
    .then((crawled) => {
      if(crawled) {
        return Promise.delay(1000)
          .then(() => crawlContacts())
      }
    })
};

const getCompanyWithoutContact = () => {
  return getCategories()
    .then((categories) => {
      let company;

      const category = _
        .chain(_.values(categories))
        .find((category) => {
          company = _.find(category.listing, (company) => {
            return _.has(company, 'contact') === false;
          });

          return company;
        })
        .value();

      return { category, company };
    });
};

const crawlContact = (category, company) => {
  let targetUrl = `${company.href.replace('https://wallux.com', 'http://wallux.com/act')}/contact-horaires`;
  console.log(targetUrl);

  return Crawler.getContact(targetUrl)
    .then(contact => saveCompanyContact(category, company, contact))
};

const saveCompanyContact = (category, company, contact) => {
  return getCategories()
    .then((categories) => {
      console.log(contact);

      const destiny = categories[category.name];
      const target = _.find(destiny.listing, { name: company.name });

      if(target) {
        _.set(target, 'contact', contact);
        // categories[category.name]['listing'][index] = Object.assign(
        //   categories[category.name]['listing'][index],
        //   { contact }
        // )
        return fs.writeJson(CATEGORIES_PATH, categories);
      }
    });
};

module.exports = {
  crawlCategories,
  crawlContacts,
  crawlListings,
  getCategories,
};
