const _ = require('lodash');

const findSameOrBefore = (series, path, date) => {
  date = (new Date(date)).valueOf();

  const dates = _.map(series, (data) => {
    return new Date(data[path]);
  });

  const diffs = _.map(dates, (point) => {
    return point.valueOf() - date;
  });

  const index = _.findLastIndex(diffs, x => x <= 0);

  if(index > -1) {
    return series[index];
  }
};

module.exports = findSameOrBefore;
