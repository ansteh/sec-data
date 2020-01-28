import * as _ from 'lodash';

import { growthRate } from './formulas/growth';

const getValues = (path, data) => {
  const fullPath = getNormedPath(path);
  return _.get(data, fullPath);
};

const getNormedPath = (path) => {
  const [report, statement] = _.split(path, '.');
  return _.join([path, 'values'], '.');
};

const map = (pool, calculate) => {
  const values = _.first(pool);

  return _.map(values, (value, index) => {
    return calculate(_.map(pool, series => _.get(series, index)));
  });
};

const getAllEntries = (data) => {
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

export const getIncomeMargins = (data) => {
  console.log('data', data, getAllEntries(data));
  const revenue = getValues('incomeStatement.revenue', data);
  const grossProfit = getValues('incomeStatement.grossProfit', data);
  const researchAndDevelopment = getValues('incomeStatement.researchAndDevelopment', data);
  const sgaExpense = getValues('incomeStatement.sellingGeneralAndAdministrativeExpense', data);
  const depreciationAndAmortization = getValues('incomeStatement.depreciationAndAmortization', data);
  const operatingIncome = getValues('incomeStatement.operatingIncome', data);
  const interestExpense = getValues('incomeStatement.interestExpense', data);
  const netIncome = getValues('incomeStatement.netIncome', data);

  const totalCurrentAssets = getValues('balanceSheet.totalCurrentAssets', data);
  const plantPropertyAndEquipmentNet = getValues('balanceSheet.plantPropertyAndEquipmentNet', data);
  const goodwill = getValues('balanceSheet.goodwill', data);

  const shortTermBorrowings = getValues('balanceSheet.shortTermBorrowings', data);
  const longTermDebtDue = getValues('balanceSheet.longTermDebtDue', data);
  const totalCurrentLiabilities = getValues('balanceSheet.totalCurrentLiabilities', data);

  const totalEquity = getValues('balanceSheet.totalEquity', data);
  const longTermDebt = getValues('balanceSheet.longTermDebt', data);
  const totalLiabilities = getValues('balanceSheet.totalLiabilities', data);

  const totalDebt = map([shortTermBorrowings, longTermDebtDue, longTermDebt], ([a, b, c]) => { return a+b+c; });

  return {
    incomeStatement: {
      grossProfit: {
        label: 'Gross Profit Margin (% Revenue)',
        values: map([grossProfit, revenue], ([a, b]) => { return a/b; }),
      },
      researchAndDevelopment: {
        label: 'Research and Development (% Gross Profit)',
        values: map([researchAndDevelopment, grossProfit], ([a, b]) => { return -a/b; }),
      },
      sellingGeneralAndAdministrativeExpense: {
        label: 'SGA (% Gross Profit)',
        values: map([sgaExpense, grossProfit], ([a, b]) => { return -a/b; }),
      },
      depreciationAndAmortization: {
        label: 'Depreciation & Amortization (% Gross Profit)',
        values: map([depreciationAndAmortization, grossProfit], ([a, b]) => { return -a/b; }),
      },
      operatingIncome: {
        label: 'Operating Income (% Gross Profit)',
        values: map([operatingIncome, grossProfit], ([a, b]) => { return a/b; }),
      },
      interestExpense: {
        label: 'Interest Expense (% Operating Income)',
        values: map([interestExpense, operatingIncome], ([a, b]) => { return -a/b; }),
      },
      netIncome: {
        label: 'Net Income (% Revenue)',
        values: map([netIncome, revenue], ([a, b]) => { return a/b; }),
      },
      operatingIncomeGrowthRate: {
        label: 'Operating Income (% Rate)',
        values: growthRate(operatingIncome),
      },
      netIncomeGrowthRate: {
        label: 'Net Income (% Rate)',
        values: growthRate(netIncome),
      },
    },
    balanceSheet: {
      currentRatio: {
        label: 'Current Ratio',
        values: map([totalCurrentAssets, totalCurrentLiabilities], ([a, b]) => { return a/b; }),
      },
      totalDebt: {
        label: 'Total Debt',
        values: totalDebt,
      },
      totalDebtToEquity: {
        label: 'Total Debt to Equity Ratio',
        values: map([totalDebt, totalEquity], ([a, b]) => { return a/b; }),
      },
    },
    other: {
      operatingIncomeToPlantPropertyAndEquipmentNet: {
        label: 'Operating Income to Plant Property and Equipment',
        values: map([operatingIncome, plantPropertyAndEquipmentNet], ([a, b]) => { return a/b; }),
      },
      totalDebtToPlantPropertyAndEquipmentNet: {
        label: 'Operating Income to Plant Property and Equipment',
        values: map([totalDebt, plantPropertyAndEquipmentNet], ([a, b]) => { return a/b; }),
      },
    }
  };
};
