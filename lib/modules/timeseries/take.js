const _ = require('lodash');
const findSameOrBefore = require('./findSameOrBefore');

const take = (series, path, date) => {
  const item = findSameOrBefore(series, path, date);
  if(_.isUndefined(item)) {
    return;
  }

  const index = _.findLastIndex(series, item);

  if(index > -1) {
    return _.slice(series, 0, index+1);
  }
};

module.exports = take;
