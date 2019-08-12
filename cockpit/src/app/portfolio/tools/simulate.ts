import * as _ from 'lodash';

const SEED = 1000;
const YEARS = 30;
const RANGE = { min: 0.04, max: 0.72 };
const INCREASE_WEIGHT = 0.2;
const ENTRIES_COUNT = 20;

const DEFAULT_ENTRY_SEED = { commitment: SEED, netValue: SEED, rate: 1 };

// const ENTRIES = _.keyBy([
//   { name: 'AAPL', commitment: SEED, netValue: SEED, rate: 1 },
//   { name: 'GM', commitment: SEED, netValue: SEED, rate: 1 },
// ], 'name');

const ENTRIES = _
  .chain(_.times(ENTRIES_COUNT, _.constant(0)))
  .map((x, index) => {
    return _.assign({ name: index }, DEFAULT_ENTRY_SEED);
  })
  .keyBy('name')
  .value();

export const simulate = (entries = ENTRIES, count = YEARS) => {
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
  const seed = 1000;
  const range = RANGE;

  const commitment = previous ? previous.commitment : seed;
  const netValue = previous ? _.max([0, change(previous.netValue, _.random(range.min, range.max))]) : commitment;
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
  const lead = Math.random() >= INCREASE_WEIGHT ? 1 : -1;
  return value + (lead * rate * value * Math.random());
};
