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

export const getCompoundAnnualGrowthRate = (start, end, numberOfYears) => {
  return Math.pow(end/start, 1/numberOfYears) - 1;
};

// assumption years interval
export const getCAGR = (series) => {
  if(!series || series.length < 2) return null;
  return getCompoundAnnualGrowthRate(_.first(series), _.last(series), series.length);
};

// console.log('getCompoundAnnualGrowthRate', getCompoundAnnualGrowthRate(100000, 126000, 5));
// console.log('getCompoundAnnualGrowthRate', getCompoundAnnualGrowthRate(44000, 126000, 3));

export const getCAGRs = (series, intervals = [10, 5, 3]) => {
  const cagrs = {};
  cagrs[series.length] = getCAGR(series)

  intervals.forEach((years) => {
    const n = Math.max(0, series.length-years);
    cagrs[years] = getCAGR(series.slice(n));
  });

  return cagrs;
};

export const getUps = (series) => {
  const rates = growthRate(series);
  const directions = _.sumBy(rates, rate => rate > 0 ? 1 : 0);
  return directions/rates.length;
};

export const getDowns = (series) => {
  const rates = growthRate(series);
  const directions = _.sumBy(rates, rate => rate < 0 ? 1 : 0);
  return directions/rates.length;
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
