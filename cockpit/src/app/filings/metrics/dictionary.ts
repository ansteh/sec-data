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

// usually used for banks
// https://www.fool.com/investing/2019/03/15/why-warren-buffett-thinks-jpmorgan-could-soar-50.aspx
// https://en.wikipedia.org/wiki/Tangible_common_equity
export const getTangibleCommonEquity = (data) => {
  const totalEquity = getValues('balanceSheet.totalEquity', data);
  const totalPreferredEquity = getValues('balanceSheet.totalPreferredEquity', data);
  const goodwill = getValues('balanceSheet.goodwill', data);
  const otherIntangibleAssets = getValues('balanceSheet.otherIntangibleAssets', data);

  let tangibleCommonEquity = subtract(totalEquity, totalPreferredEquity);
  tangibleCommonEquity = subtract(totalEquity, goodwill);
  tangibleCommonEquity = subtract(totalEquity, otherIntangibleAssets);

  // console.log(tangibleCommonEquity);

  return tangibleCommonEquity;
};

export const getAltmanZScore = (data) => {
  return map([
    getValues('incomeStatement.revenue', data),
    getEBIT(data),
    getValues('balanceSheet.totalAssets', data),
    getValues('balanceSheet.totalLiabilities', data),
    getValues('balanceSheet.retainedEarnings', data),
    getWorkingCapital(data)
  ], ([
    revenue,
    ebit,
    totalAssets,
    totalLiabilities,
    retainedEarnings,
    workingCapital
  ]) => {
    return 1.2 * (workingCapital/totalAssets)
         + 1.4 * (retainedEarnings/totalAssets)
         + 3.3 * (ebit/totalAssets)
         + 0.6 //* (marketCap/totalLiabilities)
         + 1.0 * (revenue/totalAssets);
  });
};

export const getWorkingCapital = (data) => {
  const totalCurrentAssets = getValues('balanceSheet.totalCurrentAssets', data);
  const totalCurrentLiabilities = getValues('balanceSheet.totalCurrentLiabilities', data);

  return subtract(totalCurrentAssets, totalCurrentLiabilities);;
};

export const getEBIT = (data) => {
  const preTaxIncome = getValues('incomeStatement.preTaxIncome', data);
  const interestExpense = getValues('incomeStatement.interestExpense', data);

  return subtract(preTaxIncome, interestExpense);
};
