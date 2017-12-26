const _ = require('lodash');

const spread = (series, path) => {
  const max = _.maxBy(series, path);

  if(max) {
    const index = _.findLastIndex(series, max);
    const items = _.slice(series, 0, index);

    const min = _.minBy(items, path);

    return { min, max };
  }
};

// console.log(spread([{ a: 3 }, { a: 2 }, { a: 1 }], 'a'));
// console.log(spread([{ a: 1 }, { a: 2 }, { a: 3 }], 'a'));
// console.log(spread([{ a: 2 }, { a: 1 }, { a: 3 }], 'a'));

module.exports = spread;
