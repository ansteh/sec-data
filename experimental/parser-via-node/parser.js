const Filing  = require('./../../lib/filing');

const parse = async (src) => {
  return Filing.Parser.parse(src);
};

module.exports = {
  parse,
};