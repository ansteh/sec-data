const createProjection = (path) => {
  const target = `summary.${path}`;

  const body = {};

  body[target] = {
    $slice: [`$${target}`, -1],
  };

  return { $project: body };
};

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

// console.log(JSON.stringify(createProjection('annual.DerivedDCF_IntrinsicValue'), null, 2));
// console.log(JSON.stringify(mapEndDates('annual.DerivedDCF_IntrinsicValue'), null, 2));
// console.log(JSON.stringify(filterEntryByDate('annual.DerivedDCF_IntrinsicValue', new Date('2016-09-12'), new Date('2017-09-12')), null, 2));

module.exports = {
  createProjection,
  mapEndDates,
  filterEntryByDate,
};
