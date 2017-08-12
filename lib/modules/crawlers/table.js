const _         = require('lodash');

const crawl = ($, selector, rowCrawler) => {
  let table = $(selector);

  let rows = table.find('tr');

  let result = {
    rows: []
  };

  _.forEach(rows, (row, index) => {
    if(index === 0) {
      result.header = parseHeader($, row);
    } else {
      result.rows.push(parseRow($, row, rowCrawler));
    }
  });

  return result;
};

const parseHeader = ($, header) => {
  return _.map($(header).find('th'), (column) => {
    return $(column).text();
  });
};

const parseRow = ($, element, rowCrawler) => {
  return _.map($(element).find('td'), (column, index) => {
    if(rowCrawler) {
      return rowCrawler($, column, index);
    }
    return $(column).text();
  });
};

module.exports = {
  crawl,
}
