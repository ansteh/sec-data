import * as _ from 'lodash';

export const getValues = (path, data) => {
  const fullPath = getNormedPath(path);
  return _.get(data, fullPath);
};

const getNormedPath = (path) => {
  const [report, statement] = _.split(path, '.');
  return _.join([path, 'values'], '.');
};

export const map = (pool, calculate) => {
  const values = _.first(pool);

  return _.map(values, (value, index) => {
    return calculate(_.map(pool, series => _.get(series, index)), index);
  });
};

export const getAllEntries = (data) => {
  const paths = {
    incomeStatement: _.keys(data.incomeStatement),
    balanceSheet: _.keys(data.balanceSheet),
    cashflowStatement: _.keys(data.cashflowStatement),
  };

  const entries = {};

  _.forOwn(paths, (statements, report) => {
    // console.log(statements.length);
    _.forEach(statements, (statement) => {
      if(entries[statement]) console.log(`${statement} already exists!`);
      entries[statement] = getValues(`${report}.${statement}`, data);
    });
  });

  // console.log(_.keys(entries).length);

  return entries;
};

export const devide = ([a, b]) => {
  return !b ? 0 : a/b;
};
