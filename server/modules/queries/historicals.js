const _      = require('lodash');
const Query  = require('./query');

const parseHistoricalDateFromString = () => {
  const target = `historicals`;

  const body = {};

  body[target] = {
    $map: {
       input: `$${target}`,
       as: 'parameter',
       in: {
         close: '$$parameter.close',
         date: {
           $dateFromString: {
             dateString: '$$parameter.date',
           }
         }
       }
    }
  };

  return { $project: body };
};

const filterEntries = Query.filterEntriesByRange('historicals', 'date');
const projectSlice = Query.projectSlice('historicals');
const projectLatest = Query.projectLatest('historicals');

const aggregateBy = (options) => {
  const ticker = _.get(options, 'ticker');
  const start = _.get(options, 'start');
  const end = _.get(options, 'end');

  const projection = { $project: { ticker: 1 } };

  const pipeline = [
    { $match: ticker ? { ticker } : {} },
    // _.merge({}, projection, parseHistoricalDateFromString()),
    _.merge({}, projection, filterEntries(start, end)),
    _.merge({}, projection, projectLatest),
  ];

  return { pipeline };
};

module.exports = {
  aggregateBy,
};
