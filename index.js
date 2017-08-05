const ParseXbrl = require('parse-xbrl');
const got       = require('got');
const fs        = require('fs');

const downloadFile = (sourceUrl, filename) => {
  got.stream(sourceUrl).pipe(fs.createWriteStream(`${__dirname}/resources/${filename}`));
};

const parse = (filename) => {
  ParseXbrl.parse(`${__dirname}/resources/${filename}`)
    .then((parsedDoc) => {
      console.log(JSON.stringify(parsedDoc, null, 2));
    })
    .catch(console.log);
};

// downloadFile('https://www.sec.gov/Archives/edgar/data/1018724/000101872417000011/amzn-20161231.xml', 'amzn-10-K.xml');
// downloadFile('https://www.sec.gov/Archives/edgar/data/1018724/000101872417000100/amzn-20170630.xml', 'amzn-10-Q.xml');
// parse('amzn-10-Q.xml');

// downloadFile('https://www.sec.gov/Archives/edgar/data/1467858/000146785817000028/gm-20161231.xml', 'gm-10-Q-2016.xml');
parse('gm-10-Q-2016.xml');
