const moment = require('moment');
const _         = require('lodash');

const DATE_FORMAT = 'YYYY-MM-DD';

const parseDate = (dateStr) => {
  return moment(dateStr, DATE_FORMAT);
};

module.exports = {
  DATE_FORMAT,
  parseDate
}
