const Service = require('./service');
const Price   = require('./index.js');

// Price.historical({
//   symbol: 'GME',
//   from: '2006-01-01',
//   to: '2017-11-28'
// })
// .then(console.log)
// .catch(console.log);

// Price.save('GME')
//   .then(console.log)
//   .catch(console.log);

// Price.getModel('AAOI')
//   .then((Prices) => {
//     return Prices.findByFormat('2017-11-28');
//   })
//   .then(console.log)
//   .catch(console.log);

// Price.prepareAndSaveAll()
//   .then(console.log)
//   .catch(console.log);

Price.prepareAndSaveAllMissingHistoricals()
  .then(console.log)
  .catch(console.log);
