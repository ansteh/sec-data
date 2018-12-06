const _ = require('lodash');

// arguments = {
//   value,
//   growthRate,
//   discountRate,
//   terminalRate,
//   years
// }

const getIntrinsicValue = (arguments) => {
  return getFutureValueAtGrowthStage(arguments) + getTerminalValue(arguments);
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

module.exports = {
  getIntrinsicValue,
}
