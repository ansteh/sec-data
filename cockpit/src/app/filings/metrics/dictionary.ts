import * as _ from 'lodash';

import { devide, subtract, getAllEntries, getValues, map } from './util';

export const getCapitalExpendituresToEarningsOver10Years = (data, earningsStatement = 'incomeStatement.netIncome') => {
  const capex = getValues('cashflowStatement.capitalExpenditures', data) || [];
  const earnings = getValues(earningsStatement, data) || [];

  let total = {
    capex: -_.sum(capex),
    earnings: _.sum(earnings),
  };

  return total.earnings ? total.capex/total.earnings : 0;
};

export const getOperatingIncomePerShare = (data) => {
  const operatingIncome = getValues('incomeStatement.operatingIncome', data);
  const weightedAverageDilutedSharesOutstanding = getValues('incomeStatement.weightedAverageDilutedSharesOutstanding', data);

  return map([operatingIncome, weightedAverageDilutedSharesOutstanding], devide);
};

export const getFreeCashFlow = (data) => {
  const cashFromOperations = getValues('cashflowStatement.cashFromOperations', data);
  const capitalExpenditures = getValues('cashflowStatement.capitalExpenditures', data);

  return map([cashFromOperations, capitalExpenditures], ([a, b]) => { return (a || 0) + (b || 0); });
};

export const getFreeCashFlowPerShare = (data) => {
  const freeCashFlow = getFreeCashFlow(data);
  const totalShares = getValues('incomeStatement.weightedAverageDilutedSharesOutstanding', data);

  return map([freeCashFlow, totalShares], devide);
};

export const getQuickRatio = (data) => {
  const totalCurrentAssets = getValues('balanceSheet.totalCurrentAssets', data);
  const totalCurrentLiabilities = getValues('balanceSheet.totalCurrentLiabilities', data);
  const inventory = getValues('balanceSheet.inventory', data);
  const prepaidExpenses = getValues('balanceSheet.prepaidExpenses', data);

  let quickRatio = subtract(totalCurrentAssets, inventory);
  quickRatio = subtract(quickRatio, prepaidExpenses);
  quickRatio = map([quickRatio, totalCurrentLiabilities], devide);

  // https://www.investopedia.com/terms/q/quickratio.asp
  // to get marketable securities value

  return quickRatio;
};

export const getYearsToPayoffLongTermDebt = (netIncome, longTermDebt) => {
  if(longTermDebt === 0) return 0;

  if(longTermDebt > 0) {
    if(netIncome > 0) {
      return longTermDebt/netIncome;
    }

    return null;
  }

  return null;
};
