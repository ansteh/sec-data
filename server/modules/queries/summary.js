const _      = require('lodash');
const moment = require('moment');

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

  const body = {};

  body[target] = {
    $filter: {
      input: `$${target}`,
      as: 'parameter',
      cond: {
        $and: [
          { "$gte": ['$$parameter.endDate', start] },
          { "$lte": ['$$parameter.endDate', end] },
        ]
      }
    }
  };

  return { $project: body };
};

const createProjection = (path) => {
  const target = `summary.${path}`;

  const body = {};

  body[target] = {
    $slice: [`$${target}`, -1],
  };

  return { $project: body };
};

const aggregateBy = (path, { ticker, start, end }) => {
  const projection = { $project: { ticker: 1 } };

  const pipeline = [
    { $match: ticker ? { ticker } : {} },
    _.merge({}, projection, mapEndDates(path)),
    _.merge({}, projection, filterEntryByDate(path, start, end)),
    _.merge({}, projection, createProjection(path)),
  ];

  return { pipeline };
};

module.exports = {
  createProjection,
  mapEndDates,
  filterEntryByDate,
  aggregateBy,
};
