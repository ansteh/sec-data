const fs        = require('fs');

const Filings = require('./lib/filings');

const testParseFilingsDocument = () => {
  let document = fs.readFileSync(`${__dirname}/resources/example.html`);
  let filings = Filings.Crawler.parseDocument(document);
  console.log(JSON.stringify(filings, null, 2));

  console.log(Filings.Queries.getCompany({ cik: '0001467858' }));
}

// testParseFilingsDocument();
