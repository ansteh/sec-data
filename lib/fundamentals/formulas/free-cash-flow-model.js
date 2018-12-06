const Discount = require('./discount-model.js');

// arguments = {
//   value,
//   growthRate,
//   discountRate,
//   terminalRate,
//   years
// }

const getIntrinsicValue = (arguments) => {
  return Discount.getIntrinsicValue(arguments);
};

module.exports = {
  getIntrinsicValue,
}
