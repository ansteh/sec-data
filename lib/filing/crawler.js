const got       = require('got');
const fs        = require('fs');
const _         = require('lodash');
const cheerio   = require('cheerio');

const downloadFile = (sourceUrl, filename) => {
  got.stream(sourceUrl).pipe(fs.createWriteStream(`${__dirname}/../../resources/${filename}`));
};

const parseDocument = (document) => {
  let files = crawlFiles(document);
  return files;
};

const crawlFiles = (document) => {  
  const $ = cheerio.load(document);
  let table = $('table[summary="Data Files"]');

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

module.exports = {
  downloadFile,
  parseDocument,
};
