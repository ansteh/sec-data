import * as _ from 'lodash';

export const simulate = (count = 365) => {
  const series = [];
  let step = 0;
  let date = new Date();

  while (step < count) {
    series.push({
      date,
      commitment: 0,
      netValue: 0,
      rate: _.random(1, true),
      entries: {
        AAPL: {
          // amount: 0,
          close: 153.8,
          date,
          // commitment: 0,
          // netValue: 0,
          // rate: null,
          // volume: 19918871,
        }
      }
    });

    date = addDays(date, 1);
    step += 1;
  }

  return series;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};
