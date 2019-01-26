const Exporter = require('./index.js');

// const stocks = [
//   { ticker: 'AAPL' },
//   { ticker: 'GM' },
// ];

// insertStocks(stocks)
//   .then(console.log)
//   .catch(console.log);

// findStocks({})
//   .then(stocks => console.log(_.get(_.first(stocks), 'historicals')))
//   .catch(console.log);

// updateStockResourcesBy('AAPL')
//   .then(console.log)
//   .catch(console.log);

// insertStocksByResources()
//   .then(() => { console.log(`Insertions finished!`) })
//   .catch(console.log);

// findAllTickers()
//   .then(console.log)
//   .catch(console.log);

// update external server stock resources
Exporter.updateAllStocksByResources()
  .then(() => { console.log(`All stocks have been updated!`) })
  .catch(console.log)
