const got       = require('got');
const fs        = require('fs');
const _         = require('lodash');
const cheerio   = require('cheerio');

const Table     = require('../modules/crawlers/table');

const crawl = (url) => {
  return got(url)
    .then(response => response.body);
};

const parseDocument = (document) => {
  const $ = cheerio.load(document);
  const table = Table.crawl($, 'table[summary=Results]', crawlRow);

  return prepareFilings(table);
};

const crawlRow = ($, row, index) => {
  let target = $(row);

  if(index === 1) {
    return {
      files: target.find('a[id=documentsbutton]').attr('href'),
      view: target.find('a[id=interactiveDataBtn]').attr('href')
    }
  }

  return target.text();
};

const prepareFilings = (table) => {
  const filings = {};

  filings.columns = table.header;
  filings.entries = _.map(table.rows, (row) => {
    return {
      type: row[0],
      resources: row[1],
      description: _.trim(row[2]),
      date: row[3],
      fileNumber: _.trim(row[4])
    };
  });

  return filings;
};

module.exports = {
  crawl,
  parseDocument,
};
