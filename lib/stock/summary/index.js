const Stock = require('../index.js');
const PeriodReducer = require('../reducers/period.reducer');

Stock.getMetrics('BBBY', 'EarningsPerShareDiluted', PeriodReducer.filterQuartelyPeriods)
  // .then(metrics => metrics.length)
  .then(console.log)
  .catch(console.log);
