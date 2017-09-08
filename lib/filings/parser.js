const _       = require('lodash');
const Filing  = require('../filing');

const find = _.curry((entry, filings) => {
  return _
    .chain(filings)
    .map(Filing.Parser.find(entry))
    .filter(collection => collection)
    // .flatten()
    // .uniqBy(content => content.contextRef)
    .value();
});

module.exports = {
  find,
};
