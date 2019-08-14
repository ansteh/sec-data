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

const getRange = (min = 0.04, max = 0.12) => {
  return [_.round(_.random(min, max), 2), _.round(_.random(min, max), 2)].sort();
};

const ENTRIES = _
  .chain(_.times(ENTRIES_COUNT, _.constant(0)))
  .map((x, index) => {
    const { min, max } = RANGE;

    const next = (value) => {
      return change(value, _.random(min, max));
    };

    const generator = { range: { min, max }, next, };

    return _.assign({ name: index }, DEFAULT_ENTRY_SEED);
  })
  .keyBy('name')
  .value();

const createEntries = (environment) => {
  return _
    .chain(environment)
    .map(({ count, range, weight }) => {
      return _
        .chain(_.times(count, _.constant(0)))
        .map((x, index) => {
          const [min, max] = getRange(range.min, range.max);

          const next = (value) => {
            return change(value, _.random(min, max), weight);
          };

          const generator = { range: { min, max }, next, };

          return _.assign({ name: index, generator }, DEFAULT_ENTRY_SEED);
        })
        .value();
    })
    .flatten()
    .keyBy('name')
    .value();
};

// const ENTRIES = createEntries([
//   { count: 85, range: { min: 0.02, max: 0.08 }, weight: 0.4 },
//   { count: 15, range: { min: 0.12, max: 5.01 }, weight: 0.5 },
// ]);

export const simulate = (features = ENTRIES, count = YEARS) => {
  console.log('features', features);

  const series = [];
  let step = 0;
  let date = new Date();
  let previous;

  while (step < count) {
    const nextEntries = previous
      ? simulateEntries(features, { date, previous: previous.entries })
      : _.map(features, entry => _.assign({ date }, entry));

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

export const simulateEntries = (features, { date, previous }) => {
  return _
    .chain(previous)
    .map((value, key) => {
      return createEntry({
        date,
        name: key,
        previous: value,
        feature: features[key],
      });
    })
    .keyBy('name')
    .value();
};

export const createEntry = ({ name, date, previous, feature }) => {
  const seed = 1000;
  const range = RANGE;

  const commitment = previous ? previous.commitment : seed;
  const next = _.has(feature, 'generator') ? feature.generator.next : null;
  const value = next ? next(previous.netValue) : change(previous.netValue, _.random(range.min, range.max));
  const netValue = previous ? _.max([0, value]) : commitment;
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

const change = (value, rate, weight = INCREASE_WEIGHT) => {
  const lead = Math.random() >= weight ? 1 : -1;
  return value + (lead * rate * value * Math.random());
};
