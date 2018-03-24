const _       = require('lodash');

const margin = (path) => {
  return {
    $divide: [
      { $subtract: [ `$summary.${path}.value`, "$historicals.close" ] },
      `$summary.${path}.value`
    ]
  }
};

const closePricePer = (path) => {
  return {
    $divide: [
      "$historicals.close",
      `$summary.${path}.value`,
    ]
  }
};

const isClause = (clause) => {
  return _.has(clause, 'valuation');
};

const getTarget = (clause) => {
  const type = _.get(clause, 'valuation.type');
  return `valuations.${type}.${clause.path}`;
};

const METHODS = {
  margin: margin,
  closePricePer: closePricePer,
};

const aggregateBy = (clause) => {
  const type = _.get(clause, 'valuation.type');
  const methode = METHODS[type];

  const valuations = _.set({}, `${type}.${clause.path}`, methode(clause.path));

  return {
    $project: {
      ticker: 1,
      historicals: 1,
      summary: 1,
      valuations
    }
  };
};

module.exports = {
  aggregateBy,
  getTarget,
  isClause,
  margin,
  closePricePer,
};
