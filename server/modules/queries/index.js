const _      = require('lodash');
const moment = require('moment');

const Historicals = require('./historicals.js');
const Summary = require('./summary.js');

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

  return _.merge({}, ...summaries, historical);
};

module.exports = {
  aggregate,
  Historicals,
  Summary,
};
