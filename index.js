const fs        = require('fs');

// downloadFile('https://www.sec.gov/Archives/edgar/data/1018724/000101872417000011/amzn-20161231.xml', 'amzn-10-K.xml');
// downloadFile('https://www.sec.gov/Archives/edgar/data/1018724/000101872417000100/amzn-20170630.xml', 'amzn-10-Q.xml');
// parse('amzn-10-Q.xml');

// downloadFile('https://www.sec.gov/Archives/edgar/data/1467858/000146785817000028/gm-20161231.xml', 'gm-10-Q-2016.xml');
// parse('gm-10-Q-2016.xml');

// const saveEaxmple = () => {
//   let sourceUrl = 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001467858&type=10-K&dateb=&owner=include&count=40';
//   got.stream(sourceUrl).pipe(fs.createWriteStream(`${__dirname}/resources/example.html`));
// };

const Filings = require('./lib/filings');

const testParseFilingsDocument = () => {
  let document = fs.readFileSync(`${__dirname}/resources/example.html`);
  let filings = Filings.Crawler.parseDocument(document);
  console.log(filings);

  console.log(Filings.Queries.getCompany({ cik: '0001467858' }));
}

// testParseFilingsDocument();

const Filing = require('./lib/filing');

const testDownloadFilingFile = () => {
  let sourceUrl = 'https://www.sec.gov/Archives/edgar/data/1467858/000146785817000028/0001467858-17-000028-index.htm';
  Filing.Crawler.downloadFile(sourceUrl, 'gm-test-filing.html');
};

// testDownloadFilingFile();

const testCrawlFilingDocument = () => {
  let sourceUrl = 'https://www.sec.gov/Archives/edgar/data/1467858/000146785817000028/0001467858-17-000028-index.htm';
  let filing = Filing.Crawler.parseDocument('gm-test-filing.html');
  console.log(filing);
};

testCrawlFilingDocument();
