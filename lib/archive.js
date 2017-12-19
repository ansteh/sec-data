const fs       = require('fs');
const archiver = require('archiver');

const StockService  = require('./stock/service.js');

const archiveStocks = () => {
  const output = fs.createWriteStream(`${__dirname}/../resources/stocks.zip`);

  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  output.on('close', () => {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  output.on('end', function() {
    console.log('Data has been drained');
  });

  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.log(err);
    } else {
      throw err;
    }
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);

  archive.glob(`resources/stocks/**/+(stock.json|historical-price.json|summary.json)`);

  archive.finalize();
};

archiveStocks();
