const _      = require('lodash');
const moment = require('moment')

const aggregateBy__DerivedDCF_IntrinsicValue = ({ ticker, date }) => {
  const end = moment(date).startOf('day').add(1, 'days');
  const start = moment(end).subtract(1, 'year');

  // console.log(start.toDate(), end.toDate());

  const pipeline = [
    { $match: ticker ? { ticker } : {} },
    {
      $project: {
        ticker: 1,
        'summary.annual.DerivedDCF_IntrinsicValue': {
          $map: {
             input: '$summary.annual.DerivedDCF_IntrinsicValue',
             as: 'parameter',
             in: {
               value: '$$parameter.value',
               endDate: {
                 $dateFromString: {
                   dateString: '$$parameter.endDate',
                 }
               }
             }
          }
        }
      }
    },
    {
      $project: {
        ticker: 1,
        'summary.annual.DerivedDCF_IntrinsicValue': {
          $filter: {
            input: '$summary.annual.DerivedDCF_IntrinsicValue',
            as: 'parameter',
            cond: {
              $and: [
                { "$gte": ['$$parameter.endDate', start.toDate()] },
                { "$lte": ['$$parameter.endDate', end.toDate()] },
              ]
            }
          }
        }
      }
    },
    {
      $project: {
        ticker: 1,
        'summary.annual.DerivedDCF_IntrinsicValue': {
          $slice: ['$summary.annual.DerivedDCF_IntrinsicValue', -1],
        }
      }
    },
  ];

  return { pipeline };
};

const filterBy__DerivedDCF_IntrinsicValue = ({ ticker, date }) => {
  const target = moment(date).startOf('day');
  const yearAgo = moment(date).subtract(1, 'year');

  const find = {
    ticker,
    // 'summary.annual.DerivedDCF_IntrinsicValue.endDate': date,
    // 'summary.annual.DerivedDCF_IntrinsicValue.endDate': { "$gte": yearAgo.toDate(), "$lt": target.toDate() },
  };

  const options = {
    projection: {
      ticker: 1,
      'summary.annual.DerivedDCF_IntrinsicValue': 1,
    }
  };

  return { find, options };
};

module.exports = {
  aggregateBy__DerivedDCF_IntrinsicValue,
  filterBy__DerivedDCF_IntrinsicValue,
};

// console.log(filterBy__DerivedDCF_IntrinsicValue({ ticker: 'AAPL', date: '2017-09-30' }));
