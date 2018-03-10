const _      = require('lodash');
const moment = require('moment');

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

const filterHistoricalEntries = (start, end) => {
  const target = `historicals`;

  const body = {};

  body[target] = {
    $filter: {
      input: `$${target}`,
      as: 'parameter',
      cond: {
        $and: [
          { "$gte": ['$$parameter.date', start] },
          { "$lte": ['$$parameter.date', end] },
        ]
      }
    }
  };

  return { $project: body };
};

const createHistoricalProjection = () => {
  const target = `historicals`;

  const body = {};

  body[target] = {
    $slice: [`$${target}`, -1],
  };

  return { $project: body };
};

const aggregateBy = (options) => {
  const ticker = _.get(options, 'ticker');
  const start = _.get(options, 'start');
  const end = _.get(options, 'end');

  const projection = { $project: { ticker: 1 } };

  const pipeline = [
    { $match: ticker ? { ticker } : {} },
    _.merge({}, projection, parseHistoricalDateFromString()),
    _.merge({}, projection, filterHistoricalEntries(start, end)),
    _.merge({}, projection, createHistoricalProjection()),
  ];

  return { pipeline };
};

module.exports = {
  aggregateBy,
};
