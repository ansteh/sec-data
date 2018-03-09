const _      = require('lodash');
const moment = require('moment');

const mapEndDates = (path) => {
  const target = `summary.${path}`;

  const body = {};

  body[target] = {
    $map: {
       input: `$${target}`,
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
  };

  return { $project: body };
};

const filterEntryByDate = (path, start, end) => {
  const target = `summary.${path}`;

  const body = {};

  body[target] = {
    $filter: {
      input: `$${target}`,
      as: 'parameter',
      cond: {
        $and: [
          { "$gte": ['$$parameter.endDate', start] },
          { "$lte": ['$$parameter.endDate', end] },
        ]
      }
    }
  };

  return { $project: body };
};

const createProjection = (path) => {
  const target = `summary.${path}`;

  const body = {};

  body[target] = {
    $slice: [`$${target}`, -1],
  };

  return { $project: body };
};

const aggregateBy = (path, { ticker, start, end }) => {
  const projection = { $project: { ticker: 1 } };

  const pipeline = [
    { $match: ticker ? { ticker } : {} },
    _.merge({}, projection, mapEndDates(path)),
    // _.merge({}, projection, filterEntryByDate(path, start, end)),
    _.merge({}, projection, createProjection(path)),
  ];

  return { pipeline };
};

// console.log(JSON.stringify(mapEndDates('annual.DerivedDCF_IntrinsicValue'), null, 2));
// console.log(JSON.stringify(filterEntryByDate('annual.DerivedDCF_IntrinsicValue', new Date('2016-09-12'), new Date('2017-09-12')), null, 2));
// console.log(JSON.stringify(createProjection('annual.DerivedDCF_IntrinsicValue'), null, 2));
// console.log(JSON.stringify(aggregateBy('annual.DerivedDCF_IntrinsicValue', { ticker: 'GM', start: new Date('2016-09-12'), end: new Date('2017-09-12') }), null, 2));

module.exports = {
  createProjection,
  mapEndDates,
  filterEntryByDate,
  aggregateBy,
};

// const aggregateBy__DerivedDCF_IntrinsicValue = ({ ticker, date }) => {
//   const end = moment(date).startOf('day').add(1, 'days');
//   const start = moment(end).subtract(1, 'year');
//
//   // console.log(start.toDate(), end.toDate());
//
//   const pipeline = [
//     { $match: ticker ? { ticker } : {} },
//     {
//       $project: {
//         ticker: 1,
//         'summary.annual.DerivedDCF_IntrinsicValue': {
//           $map: {
//              input: '$summary.annual.DerivedDCF_IntrinsicValue',
//              as: 'parameter',
//              in: {
//                value: '$$parameter.value',
//                endDate: {
//                  $dateFromString: {
//                    dateString: '$$parameter.endDate',
//                  }
//                }
//              }
//           }
//         }
//       }
//     },
//     {
//       $project: {
//         ticker: 1,
//         'summary.annual.DerivedDCF_IntrinsicValue': {
//           $filter: {
//             input: '$summary.annual.DerivedDCF_IntrinsicValue',
//             as: 'parameter',
//             cond: {
//               $and: [
//                 { "$gte": ['$$parameter.endDate', start.toDate()] },
//                 { "$lte": ['$$parameter.endDate', end.toDate()] },
//               ]
//             }
//           }
//         }
//       }
//     },
//     {
//       $project: {
//         ticker: 1,
//         'summary.annual.DerivedDCF_IntrinsicValue': {
//           $slice: ['$summary.annual.DerivedDCF_IntrinsicValue', -1],
//         }
//       }
//     },
//   ];
//
//   return { pipeline };
// };
