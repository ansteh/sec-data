const _ = require('lodash');

const filterEntriesByRange = _.curry((target, datePath, start, end) => {
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

module.exports = {
  filterEntriesByRange,
  projectLatest,
  projectSlice,
};
