const _       = require('lodash');
const Filing  = require('../filing');

const findDividends = (filings) => {
  return _
    .chain(filings)
    .map(Filing.Parser.findDividends)
    .filter(dividends => dividends)
    .flatten()
    .uniqBy(dividend => dividend.contextRef)
    .map(({ contextRef, $t }) => {
      return { contextRef, value: parseFloat($t) };
    })
    .value();
};

module.exports = {
  findDividends,
};
