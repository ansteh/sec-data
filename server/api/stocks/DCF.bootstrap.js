const get = (options, paths) => {
  const instructions = {
    pipeline: [
      {
        "$match": {
          "ticker": {
            "$in": [
              "GM"
            ]
          }
        }
      },
      {
        "$project": {
          "ticker": 1,
          "summary.annual.EarningsPerShareDiluted": {
            "$filter": {
              "input": "$summary.annual.EarningsPerShareDiluted",
              "as": "parameter",
              "cond": {
                "$and": [
                  {
                    "$gte": [
                      "$$parameter.endDate",
                      new Date("2009-07-27T22:00:00.000Z")
                    ]
                  },
                  {
                    "$lte": [
                      "$$parameter.endDate",
                      new Date("2018-07-27T22:00:00.000Z")
                    ]
                  }
                ]
              }
            }
          },
        }
      },
      {
        "$project": {
          "ticker": 1,
          "historicals": 1,
          // "summary.annual.EarningsPerShareDiluted": 1,
          "summary.annual.EarningsPerShareDiluted.value": 1,
          // "growth": {
          //   "$map": {
          //      // input: "$summary.annual.EarningsPerShareDiluted",
          //      input: {
          //        $zip: {
          //           inputs: [
          //             { "$summary.annual.EarningsPerShareDiluted": { $slice: [1, { $size: "summary.annual.EarningsPerShareDiluted" }] } },
          //             "$summary.annual.EarningsPerShareDiluted",
          //           ]
          //         },
          //         useLongestLength: true
          //      },
          //      as: "earnings",
          //      // in: { $add: [ "$$earnings.value", 200000 ] }
          //      in: {
          //        $let: {
          //          vars: {
          //            // previous: { $cond: { if: '$applyDiscount', then: 0.9, else: 0 } },
          //            previous: "$$earnings.value",
          //            current: "$$earnings.value",
          //          },
          //          in: { $subtract: [{ $divide: [ "$$previous", "$$current" ]}, 1] }
          //         }
          //      }
          //    }
          // }
        }
      },
      // {
      //   "$project": {
      //     "ticker": 1,
      //     "summary.annual.EarningsPerShareDiluted": {
      //       "$arrayElemAt": [
      //         "$summary.annual.EarningsPerShareDiluted",
      //         -1
      //       ]
      //     },
      //   }
      // },
      {
        "$project": {
          "ticker": 1,
          "historicals": 1,
          "summary.annual.EarningsPerShareDiluted": 1,
          "growth": 1,
        }
      }
    ]
  };

  return Stocks.aggregate(instructions);
};
