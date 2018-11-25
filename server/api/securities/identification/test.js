const Identification = require('./index.js');

Identification.getISINtoTickersByResourceFile()
  .then(console.log)
  .catch(console.log)
