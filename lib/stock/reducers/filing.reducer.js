const moment = require('moment');
const _         = require('lodash');
const Promise   = require('bluebird');

const DateReducer = require('./date.reducer');

const DATE_PROPERTY = 'DocumentPeriodEndDate';

const sortFilings = (filings) => {
  return _.sortBy(filings, (filing) => {
    const endDate = _.get(filing, `FundamentalAccountingConcepts.${DATE_PROPERTY}`);
    return DateReducer.parseDate(endDate).toDate();
  });
};

const getAllProperties = (filings) => {
  return _
    .chain(filings)
    .map(_.keys)
    .flatten()
    .uniq()
    .value();
};

module.exports = {
  getAllProperties,
  sortFilings,
};
