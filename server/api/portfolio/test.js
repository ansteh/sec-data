const Portfolio = require('./controller.js');

Portfolio.getBy({ date: new Date(2018, 6, 27) })
  .then(result => JSON.stringify(result, null, 2))
  .then(console.log)
  .catch(console.log)
