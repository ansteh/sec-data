const got       = require('got');
const fs        = require('fs');
const _         = require('lodash');
const cheerio   = require('cheerio');

const crawl = (url) => {
  return got(url)
    .then(response => response.body);
};

const parseDocument = (document) => {
  let rawFilings = crawlFilings(document);
  return prepareFilings(rawFilings);
};

const crawlFilings = (document) => {
  const $ = cheerio.load(document);
  let table = $('table[summary=Results]');

  let rows = table.find('tr');
  let result = _.map(rows, (row, index) => {
    if(index === 0) {
      return parseHeader($, row);
    }
    return parseRow($, row);
  });

  return result;
};

const parseHeader = ($, header) => {
  return _.map($(header).find('th'), (column) => {
    return $(column).text();
  });
};

const parseRow = ($, filing) => {
  return _.map($(filing).find('td'), (column, index) => {
    let target = $(column);
    if(index === 1) {
      return {
        files: target.find('a[id=documentsbutton]').attr('href'),
        view: target.find('a[id=interactiveDataBtn]').attr('href')
      }
    }
    return target.text();
  });
};

const prepareFilings = (crawledFilings) => {
  const filings = {};
  const header = crawledFilings.shift();

  filings.columns = header;
  filings.entries = _.map(crawledFilings, (row) => {
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
