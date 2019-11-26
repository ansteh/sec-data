import * as _ from 'lodash';

export const growthRate = (collection) => {
  if(!collection || collection.length < 2) {
    return 0;
  }

  return _.reduce(collection, (rates, value, index) => {
    if(index > 0) {
      let previous = collection[index-1];
      rates.push(value/previous - 1);
    }
    return rates;
  }, []);
};

export const getMeanGrowthRate = (values) => {
  if(!values || values.length < 2) {
    return 0;
  }

  const growthRates = growthRate(values);
  const momentums = getGrowthRateMomentums(values, growthRates);

  return _.mean(momentums);
};

export const getGrowthRateMomentums = (values, growthRates) => {
  return _.reduce(growthRates, (momentums, rate, index) => {
    rate = Math.abs(rate);

    const previous = values[index];
    const value = values[index+1];

    momentums.push(previous <= value ? rate : -rate);

    return momentums;
  }, []);
};

// const series = [-5, 0.1, 10, 1, 2.3, 0.5, 0.1, 5, 6];
// const growthRates = growthRate(series);
// const momentums = getGrowthRateMomentums(series, growthRates);
//
// console.log('growthRates', growthRates);
// console.log('momentums', momentums);
//
// const predit = (value, growthRates) => {
//   return growthRates.reduce((value, rate) => {
//     return (1+rate)*value;
//   }, value);
// };
//
// console.log('rates:', predit(_.first(series), growthRates));
// console.log('momentums:', predit(_.first(series), momentums));
