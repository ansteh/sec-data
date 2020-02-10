import * as _ from 'lodash';
import { getIncomeMargins } from './metrics';

export const getFilingView = (context: any) => {
  const dates = getDates(context);

  if(dates.length > 0) {
    const filing = context.filings[dates[0].date];

    return {
      dates,
      incomeStatement: _.keys(filing.incomeStatement),
      balanceSheet: _.keys(filing.balanceSheet),
      cashflowStatement: _.keys(filing.cashflowStatement),
    };
  }
};

export const getDates = (context: any) => {
  return _.map(context.filings, (filing, date) => {
    return { date, LTM: _.get(filing, 'LTM') };
  });
};

export const flatten = (stock) => {
  const dates = _.keys(stock.filings);

  const filing = _.get(stock.filings, _.first(dates));
  const paths = {
    incomeStatement: _.keys(filing.incomeStatement),
    balanceSheet: _.keys(filing.balanceSheet),
    cashflowStatement: _.keys(filing.cashflowStatement),
  };

  const statements: any = {};

  _.forOwn(stock.filings, (filing, date) => {
    _.forOwn(paths, (properties, sheet) => {
      _.forEach(properties, (property) => {
        const path = [sheet, property];

        const values = _.get(statements, [...path, 'values']);
        const value = _.get(filing, path);

        if(values) {
          values.push(value);
        } else {
          _.set(statements, path, {
            label: property,
            values: [value],
          });
        }
      });
    });
  });

  // return statements.incomeStatement;
  return { dates, statements, margins: getIncomeMargins(statements) };
};