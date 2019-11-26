import * as _ from 'lodash';

import * as Discount from './discount-model';
import { getMeanGrowthRate } from './growth';

const getValueByDate = _.curry((path, filings, date) => {
  return _.get(filings, `${date}.${path}`);
});

export const getFreeCashFlow = (dates, filings) => {
  return _
    .chain(dates)
    .map(({ date }) => {
      const cashFromOperations = getValueByDate('cashflowStatement.cashFromOperations', filings, date);
      const capitalExpenditures = getValueByDate('cashflowStatement.capitalExpenditures', filings, date);

      return {
        date,
        value: cashFromOperations + capitalExpenditures,
      };
    })
    .filter(_.identity)
    .value();
};

export const getFreeCashFlowPerShare = (dates, filings) => {
  const freeCashFlow = getFreeCashFlow(dates, filings);

  return _
    .chain(freeCashFlow)
    .map(({ date, value }) => {
      const totalShares = getValueByDate('incomeStatement.weightedAverageDilutedSharesOutstanding', filings, date);

      if(totalShares){
        return {
          date,
          value: value / totalShares,
        };
      }
    })
    .filter(_.identity)
    .value();
};

const getDiscount = (valuesPerShare, model, pivotValue) => {
  let valuesPerShareGrowtRateMean = getMeanGrowthRate(valuesPerShare);

  if(_.isUndefined(model.maxGrowthRate) === false) {
    valuesPerShareGrowtRateMean = _.min([valuesPerShareGrowtRateMean, model.maxGrowthRate]);
  }

  pivotValue = pivotValue || _.last(valuesPerShare);

  const input = Object.assign({}, model, {
    value: pivotValue,
    growthRate: valuesPerShareGrowtRateMean,
    discountRate: 0.11,
    terminalRate: 0.03,
    years: 5,
  });

  return Discount.getIntrinsicValue(input);
};

export const getDiscounts = ({ dates, filings }, model = {}) => {
  const options = {
    getDiscount,
    getValues: getFreeCashFlowPerShare,
  };

  return Discount.getDiscountAsMovingAverages(options, { dates, filings }, model)
};
