import * as _ from 'lodash';
import * as Discount from './../formulas/discount-model';

import { devide, getAllEntries, getValues, map } from './util';

const getBondEquityYield = (prices, earnings) => {
  return map([prices, earnings], devide);
};

const simulateAvgPrices = (earnings, pe) => {
  return _.map(earnings, value => value * pe);
};

const simulateLongTermRate = (earnings, rate) => {
  return _.map(earnings, value => rate);
};

const getCompoundAnnualGrowthRate = (start, end, numberOfYears) => {
  return Math.pow(end/start, 1/numberOfYears) - 1;
};

// assumption years interval
const getCAGR = (series) => {
  if(!series || series.length < 2) return null;
  return getCompoundAnnualGrowthRate(_.first(series), _.last(series), series.length);
};

// console.log('getCompoundAnnualGrowthRate', getCompoundAnnualGrowthRate(100000, 126000, 5));
// console.log('getCompoundAnnualGrowthRate', getCompoundAnnualGrowthRate(44000, 126000, 3));

const getCAGRs = (series, intervals = [10, 5, 3]) => {
  const cagrs = {};
  cagrs[series.length] = getCAGR(series)

  intervals.forEach((years) => {
    const n = Math.max(0, series.length-years);
    cagrs[years] = getCAGR(series.slice(n));
  });

  return cagrs;
};

const analyseDiscounts = (series, label) => {
  console.log(label, series);
  const cargs = getCAGRs(series);
  const discounts = [];
  const value = _.last(series);

  _.forOwn(cargs, (rate, years) => {
    const discountedFreeChasFlow = Discount.getIntrinsicValue({
      value,
      growthRate: rate,
      discountRate: 0.12,
      terminalRate: 0.04,
      years: 10,
    });
    discounts.push(discountedFreeChasFlow);

    console.log(`${label} CAGR ${_.padStart(years, 2, ' ')} years`, rate, discountedFreeChasFlow);
  });
  console.log('average price by CAGRs', _.mean(_.values(discounts)));
};

export const getValuations = (data) => {
  const weightedAverageDilutedSharesOutstanding = getValues('incomeStatement.weightedAverageDilutedSharesOutstanding', data);

  const dilutedEPS = getValues('incomeStatement.dilutedEPS', data);
  const preTaxIncome = getValues('incomeStatement.preTaxIncome', data);
  const dilutedEPSPreTax = map([preTaxIncome, weightedAverageDilutedSharesOutstanding], devide);

  const avgPrices = simulateAvgPrices(dilutedEPS, 15);
  const longTermRate = simulateLongTermRate(dilutedEPS, 0.07);
  // console.log('dilutedEPSPreTax', dilutedEPSPreTax);
  // console.log('avgPrices', avgPrices);
  // console.log('longTermRate', longTermRate);
  // analyseDiscounts(dilutedEPS, 'dilutedEPS');

  return {
    preTaxAverageBondEquityYield: {
      label: 'Pre Tax Average Bond Equity Yield',
      values: map([dilutedEPSPreTax, avgPrices], devide),
    },
    netAverageBondEquityYield: {
      label: 'Net Average Bond Equity Yield',
      values: map([dilutedEPS, avgPrices], devide),
    },
    preTaxBondEquityByLongTermRate: {
      label: 'Pre tax bond equity capitalized by long-term interest rate',
      values: map([dilutedEPSPreTax, longTermRate], devide),
    },
    netBondEquityByLongTermRate: {
      label: 'Net bond equity capitalized by long-term interest rate',
      values: map([dilutedEPS, longTermRate], devide),
    },
  };
};
