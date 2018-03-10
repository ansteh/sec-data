// console.log(JSON.stringify(mapEndDates('annual.DerivedDCF_IntrinsicValue'), null, 2));
// console.log(JSON.stringify(filterEntryByDate('annual.DerivedDCF_IntrinsicValue', new Date('2016-09-12'), new Date('2017-09-12')), null, 2));
// console.log(JSON.stringify(createProjection('annual.DerivedDCF_IntrinsicValue'), null, 2));
// console.log(JSON.stringify(aggregateBy('annual.DerivedDCF_IntrinsicValue', { ticker: 'GM', start: new Date('2016-09-12'), end: new Date('2017-09-12') }), null, 2));


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
