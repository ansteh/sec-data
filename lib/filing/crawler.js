const got       = require('got');
const fs        = require('fs');
const _         = require('lodash');
const cheerio   = require('cheerio');

const Table     = require('../modules/crawlers/table');

const downloadFile = (sourceUrl, filename) => {
  got.stream(sourceUrl).pipe(fs.createWriteStream(`${__dirname}/../../resources/${filename}`));
};

const parseDocument = (document) => {
  const $ = cheerio.load(document);
  const table = Table.crawl($, 'table[summary="Data Files"]');

  return prepare(table);
};

const prepare = (table) => {
  const links = {};

  table.header.shift();

  links.columns = table.header;
  links.entries = _.map(table.rows, (row) => {
    return {
      description: _.trim(row[1]),
      filename: row[2],
      type: row[3],
      size: row[4],
    };
  });

  return links;
};

module.exports = {
  downloadFile,
  parseDocument,
};
