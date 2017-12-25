const _            = require('lodash');
const moment       = require('moment');
const fundamentals = require('../fundamentals');

const findSameOrBefore = require('../../../modules/timeseries/findSameOrBefore');
const DATE_FORMAT = 'YYYY-MM-DD';

const getTrailingTwelveMonthsEarningsPerShareDilutedBySummary = (summary, date) => {
  const quarterlyFilings = _.get(summary, 'quarterly');
  return getTrailingTwelveMonthsEarningsPerShareDiluted(quarterlyFilings, date);
};

const getTrailingTwelveMonthsEarningsPerShareDiluted = (quarterlyFilings, date) => {
  const earningsPerShareDiluted = _.get(quarterlyFilings, 'EarningsPerShareDiluted');

  const endQuater = findSameOrBefore(earningsPerShareDiluted, 'endDate', date);
  if(endQuater) {
    const endDate = _.get(endQuater, 'endDate');

    let endIndex = _.findIndex(earningsPerShareDiluted, endQuater);
    let startIndex = endIndex-3;
    startIndex = startIndex<0 ? 0 : startIndex;

    let quaters = _.slice(earningsPerShareDiluted, startIndex, endIndex+1);

    // case if there are just three reports each year
    if(getDays(quaters) > 370) {
      quaters = _.takeRight(quaters, 3);
    }

    if(getDays(quaters) < 360) {
      return;
    }

    // console.log(startIndex);
    // console.log(quaters);

    return _
      .chain(quaters)
      .map('value')
      .sum()
      .value();
  }
};

const getDays = (quaters) => {
  const start = _.get(_.first(quaters), 'startDate');
  const end = _.get(_.last(quaters), 'endDate');

  return moment(end).diff(moment(start), 'days');
};

const getTrailingTwelveMonthsEarningsPerShareDilutedAsCollection = (quarterlyFilings) => {
  const earningsPerShareDiluted = _.get(quarterlyFilings, 'EarningsPerShareDiluted');

  const endDates = _
    .chain(earningsPerShareDiluted)
    .map('endDate')
    .tail()
    .value();

  return _
    .chain(endDates)
    .map((endDate) => {
      const value = getTrailingTwelveMonthsEarningsPerShareDiluted(quarterlyFilings, endDate);
      return { value, endDate };
    })
    .filter(item => _.isNumber(item.value) && !_.isNaN(item.value))
    .value();
};

module.exports = {
  getTrailingTwelveMonthsEarningsPerShareDiluted,
  getTrailingTwelveMonthsEarningsPerShareDilutedAsCollection,
  getTrailingTwelveMonthsEarningsPerShareDilutedBySummary,
};
