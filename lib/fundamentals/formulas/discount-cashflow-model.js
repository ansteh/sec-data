const _ = require('lodash');

// arguments = {
//   currentEarnings,
//   growthRate,
//   discountRate,
//   terminalRate,
//   years
// }

const getIntrinsicValue = (arguments) => {
  return getFutureEarningsAtGrowthStage(arguments) + getTerminalValue(arguments);
};

const getFutureEarningsAtGrowthStage = ({
  currentEarnings,
  growthRate,
  discountRate,
  years
}) => {
  const equilibrium = getEquilibrium({ growthRate, discountRate });
  const growth = equilibrium * (1 - Math.pow(equilibrium, years)) / (1 - equilibrium);

  return currentEarnings * growth;
};

const getTerminalValue = ({
  currentEarnings,
  terminalRate,
  discountRate,
  years
}) => {
  const equilibrium = getEquilibrium({ growthRate: terminalRate, discountRate });
  const growth = Math.pow(equilibrium, years) * equilibrium / (1 - equilibrium);

  return currentEarnings * growth;
};

const getEquilibrium = ({ growthRate, discountRate }) => {
  return (1 + growthRate)/(1 + discountRate);
};

module.exports = {
  getIntrinsicValue,
}
