const Util           = require('../../../../lib/util.js');

let ISIN_TO_TICKERS;

const getISINtoTickersByResourceFile = () => {
  if(ISIN_TO_TICKERS) {
    return Promise.resolve(ISIN_TO_TICKERS);
  }

  return Util.loadFileContent(`${__dirname}/resources/isin-ticker-mappings.json`)
    .then(JSON.parse)
    .catch((err) => {
      return {};
    })
    .then((mapping) => {
      ISIN_TO_TICKERS = mapping;
      return ISIN_TO_TICKERS;
    })
};

module.exports = {
  getISINtoTickersByResourceFile,
};
