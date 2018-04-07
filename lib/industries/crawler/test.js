const Crawler = require('./index.js');

// Crawler.crawlCompanyPageBySIC({ sic: '3674', start: 0 })
//   .then(content => JSON.stringify(content, null, 2))
//   .then(console.log)
//   .catch(console.log);

Crawler.crawlIndustryTitle('3674')
  .then(content => JSON.stringify(content, null, 2))
  .then(console.log)
  .catch(console.log);
