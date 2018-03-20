const _ = require('lodash');

const extractTargets = (target) => {
  const paths = target.split('.');

  return {
    source: paths.slice(0, paths.length-1).join('.'),
    property: _.last(paths),
  };
};

const filterEntriesOfFundamentalsByRange = _.curry((target, datePath, start, end) => {
  const { source, property } = extractTargets(target);
  datePath = 'DocumentPeriodEndDate';

  const body = {};

  body[source] = {
    $filter: {
      input: `$${source}`,
      as: 'parameter',
      cond: {
        $and: [
          { "$gte": [`$$parameter.${datePath}`, start] },
          { "$lte": [`$$parameter.${datePath}`, end] },
        ]
      }
    }
  };

  return { $project: body };
});

const filterEntriesByRange = _.curry((target, datePath, start, end) => {
  if(_.includes(target, 'FundamentalAccountingConcepts')) {
    return filterEntriesOfFundamentalsByRange(target, datePath, start, end);
  }

  const body = {};

  body[target] = {
    $filter: {
      input: `$${target}`,
      as: 'parameter',
      cond: {
        $and: [
          { "$gte": [`$$parameter.${datePath}`, start] },
          { "$lte": [`$$parameter.${datePath}`, end] },
        ]
      }
    }
  };

  return { $project: body };
});

const projectLatestOfFundamentals = (target) => {
  const { source, property } = extractTargets(target);
  const body = {};

  body[source] = {
    $arrayElemAt: [`$${source}`, -1]
  };

  return { $project: body };
};

const projectLatest = (target) => {
  if(_.includes(target, 'FundamentalAccountingConcepts')) {
    return projectLatestOfFundamentals(target);
  }

  const body = {};

  body[target] = {
    $arrayElemAt: [`$${target}`, -1]
  };

  return { $project: body };
};

const projectSlice = (target) => {
  const body = {};

  body[target] = {
    $slice: [`$${target}`, -1],
  };

  return { $project: body };
};

const projectTarget = (target) => {
  const body = {
    historicals: 1,
  };

  body[target] = 1;

  return { $project: body };
};

module.exports = {
  extractTargets,
  filterEntriesByRange,
  projectLatest,
  projectSlice,
  projectTarget,
};
