const moment = require('moment');
const _      = require('lodash');

// {
//     date: '2014-02-18T23:00:00.000Z',
//     open: 13.52,
//     high: 15.16,
//     low: 13.5,
//     close: 15.02,
//     volume: 101299,
//     symbol: 'AAOI'
// }

const DATE_FORMAT = 'YYYY-MM-DD';

const findByFormat = _.curry((data, date) => {
  const monthPattern = date.substr(0, 7);

  const candidates = _
    .chain(data)
    .filter((entry) => {
      return _.includes(entry.date, monthPattern);
    })
    .value();

  return findByDate(candidates, date);
});

const findByDate = (entries, date) => {
  const dateStr = getDate(date);

  const diffs = _.map(entries, (entry) => {
    return Math.abs(dateStr - getDate(entry.date));
  });

  const min = _.min(diffs);

  const index = _.findLastIndex(diffs, x => x === min);

  // console.log(diffs);
  // console.log(min);
  // console.log(index);

  if(index > -1)return entries[index];
};

const getDate = (dateStr) => {
  return parseInt(dateStr.substr(8));
};

const StockPrices = (historical) => {
  // const data = _.map(historical, (entry) => {
  //   entry.moment = moment(entry.date);
  //   return entry;
  // });

  const find = findByFormat(historical);

  return {
    findByFormat: find,
  };
};

module.exports = {
  StockPrices,
};
