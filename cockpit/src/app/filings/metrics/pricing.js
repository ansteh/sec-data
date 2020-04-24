import * as _ from 'lodash';

import * as Cashflow from './../formulas/cashflow';
import * as Dictionary from './dictionary';
import * as Discount from './../formulas/discount-model';

import { getCAGR, getCAGRs } from './../formulas/growth';

import { devide, getAllEntries, getValues, map } from './util';

const getBondEquityYield = (prices, earnings) => {
  return map([earnings, prices], devide);
};

const simulateAvgPrices = (earnings, pe) => {
  return _.map(earnings, value => value * pe);
};

const simulateLongTermRate = (earnings, rate) => {
  return _.map(earnings, value => rate);
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

export const getDCFs = (data, options) => {
  const dilutedEPS = getValues('incomeStatement.dilutedEPS', data);
  const operatingEPS = Dictionary.getOperatingIncomePerShare(data);
  const freeCashFlow = Dictionary.getFreeCashFlowPerShare(data);

  // console.log('operatingEPS', operatingEPS);
  // console.log('dilutedEPS', dilutedEPS);
  // console.log('freeCashFlow', freeCashFlow);

  // console.log('real rate', getIntrinsicValue(freeCashFlow, { discountRate: 0.01 }));
  // console.log('average rate', getIntrinsicValue(freeCashFlow, { discountRate: 0.07 }));
  // console.log('stock rate', getIntrinsicValue(freeCashFlow, { discountRate: 0.12 }));

  return {
    deps: getIntrinsicValue(dilutedEPS, options),
    oeps: getIntrinsicValue(operatingEPS, options),
    fcf: getIntrinsicValue(freeCashFlow, options),
  };
};

export const getIntrinsicValue = (series, options) => {
  const rate = getCAGR(series);
  const value = _.last(series);

  const { maxGrowthRate } = options || {};

  return Discount.getIntrinsicValue({
    value,
    // growthRate: Math.min(0.2, Math.max(0.05, rate)),
    growthRate: maxGrowthRate ? Math.min(maxGrowthRate, rate) : rate,
    // growthRate: rate,
    discountRate: _.get(options, 'discountRate', 0.12),
    terminalRate: 0.04,
    years: _.get(options, 'years', 10),
  });
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
  // console.log(getDCFs(data));

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
