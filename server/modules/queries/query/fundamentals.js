const _ = require('lodash');

const extractTargets = (target) => {
  const paths = target.split('.');

  return {
    source: paths.slice(0, paths.length-1).join('.'),
    property: _.last(paths),
  };
};

const filterEntriesByRange = _.curry((target, datePath, start, end) => {
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

const projectLatest = (target) => {
  const { source, property } = extractTargets(target);
  const body = {};

  body[source] = {
    $arrayElemAt: [`$${source}`, -1]
  };

  return { $project: body };
};

const projectTarget = (target) => {
  const body = {
    historicals: 1,
  };

  const { source } = extractTargets(target);

  body[target] = {
    value: `$${target}`,
    endDate: `$${source}.DocumentPeriodEndDate`
  };

  return { $project: body };
};

module.exports = {
  extractTargets,
  filterEntriesByRange,
  projectLatest,
  projectTarget,
};
