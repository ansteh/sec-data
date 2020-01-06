import * as _ from 'lodash';

// options = {
//   value,
//   growthRate,
//   discountRate,
//   terminalRate,
//   years
// }

export const getIntrinsicValue = (options) => {
  // console.log(options);
  const growthValue = getFutureValueAtGrowthStage(options);
  const terminalValue = options.terminalRate ? getTerminalValue(options) : 0;

  // console.log('Growth Value', growthValue);
  // console.log('Terminal Value', terminalValue);

  return growthValue + terminalValue;
};

const getFutureValueAtGrowthStage = ({
  value,
  growthRate,
  discountRate,
  years
}) => {
  const equilibrium = getEquilibrium({ growthRate, discountRate });
  const growth = equilibrium * (1 - Math.pow(equilibrium, years)) / (1 - equilibrium);

  // var v1 = value * geomSeries(equilibrium, 1, years);
  // console.log('v1', v1);

  return value * growth;
};

// gordon growth model:
const getTerminalValue = ({
  value,

  growthRate,
  years,

  terminalRate,
  terminalYears,

  discountRate
}) => {
  const terminalPeriodes = terminalYears || years;

  const equilibrium = getEquilibrium({ growthRate: terminalRate, discountRate });
  const total = futureValue(value, growthRate, years) * geomSeries(equilibrium, 1, terminalPeriodes);

  return presentValue(total, discountRate, terminalPeriodes);
};

const getEquilibrium = ({ growthRate, discountRate }) => {
  return (1 + growthRate)/(1 + discountRate);
};

const futureValue = (value, rate, periodes) => {
  return value * Math.pow(1+rate, periodes);
};

const presentValue =  (value, rate, periodes) => {
  return value/Math.pow(1+rate, periodes);
};

const geomSeries = (rate, since, periodes) => {
	let amt;

	if (rate == 1.0) {
    amt = periodes + 1;
  } else {
    amt = (Math.pow(rate, periodes + 1) - 1)/(rate - 1);
  }

	if (since >= 1) amt -= geomSeries(rate, 0, since-1);

	return amt;
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
