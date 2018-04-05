const got       = require('got');
const fs        = require('fs');
const _         = require('lodash');
const cheerio   = require('cheerio');

const getCategories = (targetUrl) => {
  return got(targetUrl)
    .then(response => response.body)
    .then(parseDocument);
};

const parseDocument = (document) => {
  const $ = cheerio.load(document);

  const categories = $('#conteneur #nav_activite .col_lexique a');
  const entries = _.map(categories, (row) => {
    const element = $(row);

    return {
      name: element.text(),
      href: element.attr('href'),
    };
  });
  
  return entries;
};

module.exports = {
  getCategories,
};
