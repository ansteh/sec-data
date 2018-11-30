const Audit          = require('./model');

Audit.getValuation()
  // .then(_.last)
  // .then(content => JSON.stringify(content, null, 2))
  .then(console.log)
  .catch(console.log);
