module.exports = Object.assign({},
  require('./properties/book-value-per-share'),
  require('./properties/total-assets'),
  require('./properties/total-liabilities'),
  require('./properties/total-equity'),
  require('./properties/cashflow-discount'),
  { fundamentals : require('./fundamentals') },
);