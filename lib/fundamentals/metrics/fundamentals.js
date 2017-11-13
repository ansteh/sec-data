const _ = require('lodash');

const get = (filings, property) => {
  return _
    .chain(_.get(filings, 'FundamentalAccountingConcepts'))
    .map(filing => _.pick(filing, [property, 'DocumentPeriodEndDate']))
    .value();
};

module.exports = {
  get,
};
