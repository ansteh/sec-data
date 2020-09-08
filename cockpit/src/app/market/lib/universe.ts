import * as _ from 'lodash';

export const createTestUnviverse = () => {
  const assets = [
    {
      id: 'NYSE:AAPL',
      exchange: 'NYSE',
      ticker: 'AAPL',
      currencyCode: 'DOLLAR',
    },
  ];

  const lookups = _.keyBy(assets, 'id');

  const get = async id => _.get(lookups, id);

  const getQuote = async (id) => {
    return {
      date: new Date(),
      close: _.random(10.5, 160.5),
      currencyCode: 'DOLLAR',
    };
  };

  const filterByIds = (ids?) => {
    if(!ids || ids.length === 0) return getAll();
    return _.filter(assets, asset => ids.indexOf(asset.id) !== -1);
  };

  const getAll = () => { return assets.slice(0); };

  return {
    filterByIds,
    get,
    getAll,
    getQuote,
  };
};
