const _      = require('lodash');
const moment = require('moment');
const Query  = require('./query');

const mapEndDates = (path) => {
  const target = `summary.${path}`;

  const body = {};

  body[target] = {
    $map: {
       input: `$${target}`,
       as: 'parameter',
       in: {
         value: '$$parameter.value',
         endDate: {
           $dateFromString: {
             dateString: '$$parameter.endDate',
           }
         }
       }
    }
  };

  return { $project: body };
};

const filterEntryByDate = (path, start, end) => {
  const target = `summary.${path}`;
  return Query.filterEntriesByRange(target, 'endDate', start, end);
};

const projectSlice = (path) => {
  const target = `summary.${path}`;
  return Query.projectSlice(target);
};

const projectLatest = (path) => {
  const target = `summary.${path}`;
  return Query.projectLatest(target);
};

const projectTarget = (path) => {
  const target = `summary.${path}`;
  return Query.projectTarget(target);
};

const aggregateBy = (path, { ticker, tickers, start, end }) => {
  const projection = { $project: { ticker: 1 } };

  const pipeline = [
    matchTicker({ ticker, tickers }),
    // _.merge({}, projection, mapEndDates(path)),
    _.merge({}, projection, filterEntryByDate(path, start, end)),
    _.merge({}, projection, projectLatest(path)),
    _.merge({}, projection, projectTarget(path)),
  ];

  return { pipeline };
};

const matchTicker = ({ ticker, tickers }) => {
  if(tickers) {
    return {
      $match: {
        ticker: { $in: tickers }
      }
    };
  }

  return { $match: ticker ? { ticker } : {} };
};

module.exports = {
  mapEndDates,
  filterEntryByDate,
  aggregateBy,
};
