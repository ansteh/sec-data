const Price   = require('./price');
const Stock   = require('./index');
const Summary = require('./summary');

const refresh = async () => {
  await Stock.updateMissingStockFilings();
  await Stock.downloadMissingFilingFilesBy();
  await Stock.parseUnparsedFilings();
  
  await Summary.prepareAndSaveAll();
  
  // await Price.updateAll();
  
  return { success: true };
};

module.exports = {
  
};