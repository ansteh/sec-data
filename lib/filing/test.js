const fs        = require('fs');
const Filing = require('./lib/filing');

const testDownloadFilingFile = () => {
  let sourceUrl = 'https://www.sec.gov/Archives/edgar/data/1467858/000146785817000028/0001467858-17-000028-index.htm';
  Filing.Crawler.downloadFile(sourceUrl, 'gm-test-filing.html');
};

// testDownloadFilingFile();

const testCrawlFilingDocument = () => {
  let sourceUrl = 'https://www.sec.gov/Archives/edgar/data/1467858/000146785817000028/0001467858-17-000028-index.htm';
  let document = fs.readFileSync(`${__dirname}/resources/gm-test-filing.html`);
  let filing = Filing.Crawler.parseDocument(document);
  console.log(filing);
};

// testCrawlFilingDocument();
