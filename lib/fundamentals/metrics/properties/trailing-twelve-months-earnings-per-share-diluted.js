const _            = require('lodash');
const moment       = require('moment');
const fundamentals = require('../fundamentals');

const findSameOrBefore = require('../../../modules/timeseries/findSameOrBefore');
const DATE_FORMAT = 'YYYY-MM-DD';

const getTrailingsTwelveMonthsEarningsPerShareDiluted = (quarterlyFilings, date) => {
  const earningsPerShareDiluted = _.get(quarterlyFilings, 'EarningsPerShareDiluted');

  const endQuater = findSameOrBefore(earningsPerShareDiluted, 'endDate', date);
  if(endQuater) {
    const endDate = _.get(endQuater, 'endDate');
    const startDate = moment(endDate).subtract(1, 'year').toDate();

    const startQuater = findSameOrBefore(earningsPerShareDiluted, 'endDate', startDate);

    let startIndex = _.findIndex(earningsPerShareDiluted, startQuater);
    let endIndex = _.findIndex(earningsPerShareDiluted, endQuater);

    if(moment(startDate).format(DATE_FORMAT) !== moment(_.get(startQuater, 'endDate')).format(DATE_FORMAT)) {
      startIndex += 1;
    }

    if(startIndex) {
      startIndex = startQuater ? startIndex+1 : 0;

      let quaters = _.slice(earningsPerShareDiluted, startIndex, endIndex+1);
      quaters = _.takeRight(quaters, 4);

      // case if there are just three reports each year
      if(getDays(quaters) > 370) {
        quaters = _.takeRight(quaters, 3);
      }

      // console.log(startIndex);
      // console.log(quaters);

      return _
        .chain(quaters)
        .map('value')
        .sum()
        .value();
    }
  }
};

const getDays = (quaters) => {
  const start = _.get(_.first(quaters), 'startDate');
  const end = _.get(_.last(quaters), 'endDate');

  return moment(end).diff(moment(start), 'days');
};

module.exports = {
  getTrailingsTwelveMonthsEarningsPerShareDiluted,
};
