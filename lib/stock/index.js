const Service = require('./service');

const create = (stock) => {
  return Service.create(stock);
};

const remove = (stock) => {
  return Service.remove(stock);
};

module.exports = {
  create,
  remove,
}
