const _ = require('lodash');
const Fundamentals = require('./fundamentals.js');

const filterEntriesByRange = _.curry((target, datePath, start, end) => {
  if(_.includes(target, 'FundamentalAccountingConcepts')) {
    return Fundamentals.filterEntriesByRange(target, datePath, start, end);
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

const projectLatest = (target) => {
  if(_.includes(target, 'FundamentalAccountingConcepts')) {
    return Fundamentals.projectLatest(target);
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
  if(_.includes(target, 'FundamentalAccountingConcepts')) {
    return Fundamentals.projectTarget(target);
  }

  const body = {
    historicals: 1,
  };

  body[target] = 1;

  return { $project: body };
};

const filter = _.curry((target, conditions) => {
  const body = {};

  _.forEach(conditions, (value, operator) => {
    const condition = _.set({}, operator, value);
    body[target] = condition;
  });

  return { $match: body };
});

module.exports = {
  extractTargets: Fundamentals.extractTargets,
  filter,
  filterEntriesByRange,
  projectLatest,
  projectSlice,
  projectTarget,
};
