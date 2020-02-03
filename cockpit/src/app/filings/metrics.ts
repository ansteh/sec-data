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

const devide = ([a, b]) => {
  return !b ? 0 : a/b;
};

const getYearsToPayoffLongTermDebt = (netIncome, longTermDebt) => {
  if(longTermDebt === 0) return 0;

  if(longTermDebt > 0) {
    if(netIncome > 0) {
      return longTermDebt/netIncome;
    }

    return null;
  }

  return null;
};

export const getIncomeMargins = (data) => {
  // console.log('data', data, getAllEntries(data));

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
  const totalAssets = getValues('balanceSheet.totalAssets', data);

  const repurchaseOfCommonStock = getValues('cashflowStatement.repurchaseOfCommonStock', data);

  const totalShortTermDebt = map([shortTermBorrowings, longTermDebtDue], ([a, b]) => { return a+b; });
  const totalDebt = map([totalShortTermDebt, longTermDebt], ([a, b]) => { return a+b; });
  const treasuryShareAdjustedTotalEquity = map([totalEquity, repurchaseOfCommonStock], ([a, b]) => { return a-b; });

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
        values: map([totalCurrentAssets, totalCurrentLiabilities], devide),
      },
      shortToLongDebtRatio: {
        label: 'Short Term Debt to Long Term Debt Ratio',
        values: map([shortTermBorrowings, longTermDebt], devide),
      },
      totalShortToLongDebtRatio: {
        label: 'Total Short Term Debt to Long Term Debt Ratio',
        values: map([totalShortTermDebt, longTermDebt], devide),
      },
      yearsToPayoffLongTermDebt: {
        label: 'Years to payoff Long Term Debt',
        values: map([netIncome, longTermDebt], ([a, b]) => getYearsToPayoffLongTermDebt(a, b)),
      },
      returnOnAssetRatio: {
        label: 'Return on Asset Ratio',
        values: map([netIncome, totalAssets], devide),
      },
      totalDebt: {
        label: 'Total Debt',
        values: totalDebt,
      },
      totalDebtToEquity: {
        label: 'Total Debt to Equity Ratio',
        values: map([totalLiabilities, totalEquity], devide),
      },
      treasuryShareAdjustedDebtToEquity: {
        label: 'Treasury share-adjusted Total Debt to Equity Ratio',
        values: map([totalLiabilities, treasuryShareAdjustedTotalEquity], devide),
      },
    },
    other: {
      operatingIncomeToPlantPropertyAndEquipmentNet: {
        label: 'Operating Income to Plant Property and Equipment',
        values: map([operatingIncome, plantPropertyAndEquipmentNet], devide),
      },
      totalDebtToPlantPropertyAndEquipmentNet: {
        label: 'Operating Income to Plant Property and Equipment',
        values: map([totalDebt, plantPropertyAndEquipmentNet], devide),
      },
    }
  };
};
