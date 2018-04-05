const got       = require('got');
const fs        = require('fs');
const _         = require('lodash');
const cheerio   = require('cheerio');

const Table     = require('../../modules/crawlers/table');

const GET_COMPANY_BASE = 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany';

const getCompanyPageUrlBySIC = (params) => {
  const count = _.get(params, 'count', 100);
  const start = _.get(params, 'start', 0);

  return `${GET_COMPANY_BASE}&SIC=${params.sic}&owner=include&match=&start=${start}&count=${count}&hidefilings=0`
};

const getPagination = (start = 0) => {
  return { start, count: 100 };
};

const crawlCompanyPageBySIC = (params) => {
  _.assign(params, getPagination(params.start));
  const targetUrl = getCompanyPageUrlBySIC(params);
  console.log('targetUrl', targetUrl);

  return got(targetUrl)
    .then(response => response.body)
    .then(parseDocument);
};

const parseDocument = (document) => {
  const $ = cheerio.load(document);
  const table = Table.crawl($, 'table[summary="Results"]');

  return {
    stocks: extractStocks(table),
    hasNextPage: !!_.first($('input[value^="Next"]')),
  };
};

const extractStocks = (table) => {
  const stocks = {};

  stocks.columns = table.header;
  stocks.entries = _.map(table.rows, (row) => {
    return {
      cik: _.trim(row[0]),
      name: row[1],
      location: row[2],
    };
  });

  return stocks;
};

module.exports = {
  crawlCompanyPageBySIC,
};
