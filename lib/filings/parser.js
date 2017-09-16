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

const findPathsToRefs = (ticker, refs) => {
  return readFilings(ticker, undefined)
    .then((filings) => {
      return _
        .chain(filings)
        .map(filing => traverse(filing, refs))
        .flatten()
        .uniq()
        .value();
    });
};

const traverse = (scope, values, path = '') => {
  let matches = [];

  if(_.isString(scope) || _.isNumber(scope) || _.isBoolean(scope)) {
    return matches;
  }

  if(_.has(scope, 'contextRef')) {
    if(_.includes(values, scope.contextRef)) {
      _.pull(values, scope.contextRef);
      console.log(scope);
      matches.push(`${path}`);
    }
  }

  if(_.isArray(scope)) {
    let results = _.map(scope, (candidate, index) => {
      return traverse(candidate, values, `${path}.${index}`);
    });
    matches = matches.concat(_.flatten(results));
  } else if(_.isPlainObject(scope)) {
    _.forOwn(scope, (candidate, key) => {
      if(key !== 'contextRef' && (_.isPlainObject(candidate) || _.isArray(candidate))) {
        let deepMatches = traverse(candidate, values, `${path}.${key}`);
        matches = matches.concat(deepMatches);
      }
    });
  }

  return matches;
};

const getContext = (ticker) => {
  return readFilings(ticker, undefined)
    .then((filings) => {
      return _.map(filings, 'context');
    });
};

module.exports = {
  find,
  findPathsToRefs,
  getContext,
  traverse,
};
