import * as _ from 'lodash';

export const simulate = (count = 365) => {
  const series = [];
  let step = 0;
  let date = new Date();
  let previous;

  while (step < count) {
    const rate = previous
      ? previous.rate + ((_.random(1, true) >= 0.5 ? -1 : 1) * (0.07 * _.random(1, true)))
      : 1;

    previous = {
      date,
      commitment: 0,
      netValue: 0,
      rate: _.max([0, rate]),
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
    };

    series.push(previous);

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
