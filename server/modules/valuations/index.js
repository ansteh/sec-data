const appendValuationsTo = (paths, pipeline) => {
  const projection = {
    $project: {
      ticker: 1,
      historicals: 1,
      summary: 1,
      margin: {
        $cond: [
          {
            $or: [
              { $eq: [ `$summary.${paths.intrinsicValue}.value`, null ] },
              { $eq: [ `$summary.${paths.intrinsicValue}.value`, 0 ] }
            ]
          },
          "N/A",
          {
            $divide: [
              { $subtract: [ `$summary.${paths.intrinsicValue}.value`, "$historicals.close" ] },
              `$summary.${paths.intrinsicValue}.value`
            ]
          }
        ]
      },
      PE: {
        $cond: [
          {
            $or: [
              { $eq: [ `$summary.${paths.earnings}.value`, null ] },
              { $eq: [ `$summary.${paths.earnings}.value`, 0 ] }
            ]
          },
          "N/A",
          {
            $divide: [
              "$historicals.close",
              `$summary.${paths.earnings}.value`,
            ]
          }
        ]
      },
      PB: {
        $cond: [
          {
            $or: [
              { $eq: [ `$summary.${paths.bookValue}.value`, null ] },
              { $eq: [ `$summary.${paths.bookValue}.value`, 0 ] }
            ]
          },
          "N/A",
          {
            $divide: [
              "$historicals.close",
              `$summary.${paths.bookValue}.value`,
            ]
          }
        ]
      },
      ROE: `$summary.${paths.roe}.value`,
      ROA: `$summary.${paths.roa}.value`,
    }
  };

  pipeline.push(projection);
};

module.exports = {
  appendValuationsTo,
};
