const got       = require('got');
const fs        = require('fs');
const _         = require('lodash');
const cheerio   = require('cheerio');

const Table     = require('../modules/crawlers/table');

const downloadFile = (sourceUrl, filepath) => {
  return new Promise((resolve, reject) => {
    let readable = got.stream(sourceUrl)
      .on('error', (err) => { reject(err); });

    let writable = fs.createWriteStream(`${__dirname}/../../resources/${filepath}`)
      .on('finish', () => {
        resolve(true);
      })
      .on('error', (err) => {
        reject(err);
      });

      readable.pipe(writable);
  });
};

const crawlInstanceFilenUrl = (filingUrl) => {
  return got(filingUrl)
    .then(response => response.body)
    .then(parseDocument)
    .then((table) => {
      let filename = _
        .chain(table.entries)
        .find({ type: 'EX-101.INS' })
        .get('filename')
        .value();

      let baseUrl = filingUrl.substring(0, filingUrl.lastIndexOf("/"));

      return `${baseUrl}/${filename}`;
    });
};

const parseDocument = (document) => {
  const $ = cheerio.load(document);
  const table = Table.crawl($, 'table[summary="Data Files"]');

  return prepare(table);
};

const prepare = (table) => {
  const links = {};

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
  crawlInstanceFilenUrl,
  downloadFile,
  parseDocument,
};
