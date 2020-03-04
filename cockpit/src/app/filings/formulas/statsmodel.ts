import * as _ from 'lodash';

export const getStandardDeviation = (data) => {
  const m = _.mean(data);
  const diffs = data.reduce((sq, n) => sq + Math.pow(n - m, 2), 0);

  return Math.sqrt(diffs / (data.length - 1));
};
