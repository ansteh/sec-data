const _ = require('lodash');

const growthRate = (collection) => {
  return _.reduce(collection, (rates, value, index) => {
    if(index > 0) {
      let previous = collection[index-1];
      rates.push(value/previous - 1);
    }
    return rates;
  }, []);
};

module.exports = growthRate;
