import * as _ from 'lodash';

// options = {
//   value,
//   growthRate,
//   discountRate,
//   terminalRate,
//   years
// }

export const getIntrinsicValue = (options) => {
  return getFutureValueAtGrowthStage(options) + getTerminalValue(options);
};

const getFutureValueAtGrowthStage = ({
  value,
  growthRate,
  discountRate,
  years
}) => {
  const equilibrium = getEquilibrium({ growthRate, discountRate });
  const growth = equilibrium * (1 - Math.pow(equilibrium, years)) / (1 - equilibrium);

  return value * growth;
};

const getTerminalValue = ({
  value,
  terminalRate,
  discountRate,
  years
}) => {
  const equilibrium = getEquilibrium({ growthRate: terminalRate, discountRate });
  const growth = Math.pow(equilibrium, years) * equilibrium / (1 - equilibrium);

  return value * growth;
};

const getEquilibrium = ({ growthRate, discountRate }) => {
  return (1 + growthRate)/(1 + discountRate);
};

// const getDiscountFreeCashFlowAsCollection = (getDFCF, filings, maxGrowthRate) => {
//   const freeCashFlowPerShare = getFreeCashFlowPerShare(filings);
//
//   const endDates = _
//     .chain(freeCashFlowPerShare)
//     .map('endDate')
//     .tail()
//     .value();
//
//   return _.reduce(endDates, (valuations, endDate, index) => {
//     const freeCashFlow = _.slice(freeCashFlowPerShare, 0, index+2);
//     const value = getDFCF(freeCashFlow, maxGrowthRate);
//
//     valuations.push({ value, endDate });
//
//     return valuations;
//   }, []);
// };

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
