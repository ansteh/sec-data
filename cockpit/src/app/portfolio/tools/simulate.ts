import * as _ from 'lodash';

const RATE = 0.07;
const SEED = 1000;

const DEFAULT_ENTRY_SEED = { commitment: SEED, netValue: SEED, rate: 1 };

// const ENTRIES = _.keyBy([
//   { name: 'AAPL', commitment: SEED, netValue: SEED, rate: 1 },
//   { name: 'GM', commitment: SEED, netValue: SEED, rate: 1 },
// ], 'name');

const ENTRIES = _
  .chain(_.times(10, _.constant(0)))
  .map((x, index) => {
    return _.assign({ name: index }, DEFAULT_ENTRY_SEED);
  })
  .keyBy('name')
  .value();

export const simulate = (entries = ENTRIES, count = 365) => {
  const series = [];
  let step = 0;
  let date = new Date();
  let previous;

  while (step < count) {
    const nextEntries = previous
      ? simulateEntries(date, previous.entries)
      : _.map(entries, entry => _.assign({ date }, entry));

    const commitment = _.sum(_.map(nextEntries, 'commitment'));
    const netValue = _.sum(_.map(nextEntries, 'netValue'));
    const rate = commitment > 0 ? netValue/commitment : 0;

    previous = {
      date,
      commitment,
      netValue,
      rate,
      entries: nextEntries,
    };

    series.push(previous);

    date = addDays(date, 1);
    step += 1;
  }

  return series;
};

export const simulateEntries = (date, previous) => {
  return _
    .chain(previous)
    .map((value, key) => {
      return createEntry({
        date,
        name: key,
        previous: value
      });
    })
    .keyBy('name')
    .value();
};

export const createEntry = ({ name, date, previous }) => {
  const RATE = 0.07;
  const SEED = 1000;

  const commitment = previous ? previous.commitment : SEED;
  const netValue = previous ? _.max([0, change(previous.netValue, RATE)]) : commitment;
  const rate = commitment > 0 ? netValue/commitment : 0;

  return {
    name,
    date,
    commitment,
    netValue,
    rate,
    // close: 23
  };
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const change = (value, rate) => {
  const lead = Math.random() >= 0.5 ? -1 : 1;
  return value + (lead * rate * value * Math.random());
};
