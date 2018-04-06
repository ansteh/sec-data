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

const getListing = (targetUrl) => {
  return got(targetUrl)
    .then(response => response.body)
    .then(parseListing);
};

const parseListing = (document) => {
  const $ = cheerio.load(document);

  const content = $('#conteneur #nav_activite');

  let currentLocation;

  return _
    .chain(content.children())
    .map((row) => {
      const element = $(row);

      if(element.is('h3')) {
        return {
          name: element.text().replace(/(^\s+|\s+$)/g,'')
        };
      }

      if(element.is('a')) {
        return {
          name: element.children().first().text(),
          tags: element.children().last().text(),
          href: element.attr('href'),
        };
      }
    })
    .filter(x => x)
    .reduce((entries, entry) => {
      if(_.has(entry, 'href')) {
        entry.location = currentLocation;
        entries.push(entry);
      } else {
        currentLocation = entry.name;
      }

      return entries;
    }, [])
    .value();
};

const getContact = (targetUrl) => {
  return got(targetUrl)
    .then(response => response.body)
    .then(parseContact);
};

const parseContact = (document) => {
  const $ = cheerio.load(document);

  const infos = $('#hauteur_corps').find('table').first();
  const entries = $(infos).find('tr');

  return {
    name: $(entries.eq(0)).find('td').last().find('h3').text(),
    owner: $(entries.eq(1)).find('td').last().text(),
    phone: $(entries.eq(2)).find('td').last().text(),
    address: $(entries.eq(3)).find('td').last().text(),
    location: $(entries.eq(4)).find('td').last().text().replace(/(^\s+|\s+$)/g,''),
    contact: $(entries.eq(6)).find('td').last().text(),
  };
};

module.exports = {
  getCategories,
  getContact,
  getListing,
};
