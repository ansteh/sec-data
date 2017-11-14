const _ = require('lodash');

const getValues = (periods, dates) => {
  return _
    .chain(periods)
    .filter(({ endDate }) => {
      return _.includes(dates, endDate);
    })
    .value();
};

module.exports = {
  getValues,
};
