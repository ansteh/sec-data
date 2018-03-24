const _      = require('lodash');
const moment = require('moment');

const Historicals = require('./historicals.js');
const Query = require('./query');
const Summary = require('./summary.js');
const Valuations = require('./valuations');

const projectValuations = (clauses) => {
  const valuables = _.filter(clauses, clause => _.has(clause, 'valuation'));
  return _.map(valuables, Valuations.aggregateBy);
};

const getTarget = (clause) => {
  if(Valuations.isClause(clause)) {
    return Valuations.getTarget(clause);
  }

  return `summary.${clause.path}`;
};

const projectFilters = (clauses) => {
  const filterables = _.filter(clauses, clause => _.has(clause, 'filter'));
  return _.map(filterables, (clause) => {
    return Query.filter(getTarget(clause), clause.filter);
  });
};

const aggregate = (clauses, params) => {
  const { date } = params;
  const end = moment(date).startOf('day').add(1, 'days');

  const annualRange = {
    start: moment(end).subtract(1, 'year').toDate(),
    end: end.toDate(),
  };
  const summaries = clauses.map((clause) => {
    const clauseParams = _.assign(annualRange, params, clause.params);
    return Summary.aggregateBy(clause.path, clauseParams);
  });

  const historicalRange = {
    start: moment(end).subtract(8, 'days').toDate(),
    end: end.toDate(),
  };
  const historical = Historicals.aggregateBy(_.assign({}, historicalRange, params));

  const aggregation = _.merge({}, ...summaries, historical);

  const valuations = projectValuations(clauses);
  if(valuations.length > 0) {
    aggregation.pipeline.push(_.merge({}, ...valuations));
  }

  const filters = projectFilters(clauses);
  if(filters.length > 0) {
    aggregation.pipeline.push(_.merge({}, ...filters));
  }
  
  // console.log(JSON.stringify(aggregation, null, 2));

  return aggregation;
};

module.exports = {
  aggregate,
  Historicals,
  Summary,
};
