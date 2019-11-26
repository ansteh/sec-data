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

export const getDiscountAsMovingAverages = ({ getValues, getDiscount }, { dates, filings }, model) => {
  model = model || {};

  const series = getValues(dates, filings);
  const endDates = _.tail(dates);

  return endDates.map(({ date }, index) => {
    const frame = _.map(series.slice(0, index+2), 'value');

    return {
      value: getDiscount(frame, model),
      date
    };
  });
};
