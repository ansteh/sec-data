const fs        = require('fs');
const Filing    = require('../index.js');
const _         = require('lodash');

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

const filter = (stack, needle) => {
  needle = _.toLower(needle);
  return _.filter(stack, (str) => {
    return _.includes(_.toLower(str), needle);
  });
};

const testParseFiling = () => {
  const filingFile = `${__dirname}/../../resources/stocks/GM/files/10-K_2017-02-07.xml`;
  //const filingFile = `${__dirname}/../../resources/stocks/GM/files/10-K_2016-02-03.xml`;
  //const filingFile = `${__dirname}/../../resources/stocks/GM/files/10-K_2015-02-04.xml`;
  //const filingFile = `${__dirname}/../../resources/stocks/GM/files/10-K_2014-02-06.xml`;

  // return Filing.Parser.parseXbrl(filingFile)
  return Filing.Parser.parseFile(filingFile)
    .then((content) => {
      // console.log(JSON.stringify(content, null, 2));
      // console.log(JSON.stringify(Filing.Parser.removeTextBlocks(content), null, 2));

      let keys = Object.keys(content);
      console.log('properties', keys.length);
      // console.log(keys);
      console.log(filter(keys, 'Dividend'));
      //Seems to exists two possible definitions of dividends
      //console.log('DividendsAndRoyalties', content['gm:DividendsAndRoyalties']);
      console.log('us-gaap:CommonStockDividendsPerShareCashPaid', content['us-gaap:CommonStockDividendsPerShareCashPaid']);
      console.log('us-gaap:CommonStockDividendsPerShareDeclared', content['us-gaap:CommonStockDividendsPerShareDeclared']);
      //console.log('us-gaap:PaymentsOfDividends', content['us-gaap:PaymentsOfDividends']);

      // console.log('DividendsAndRoyalties', content['gm:DividendsAndRoyalties']);
      console.log('DividendsCommonStock', content['us-gaap:DividendsCommonStock']);
      // console.log('us-gaap:PaymentsOfDividendsCommonStock', content['us-gaap:PaymentsOfDividendsCommonStock']);

      // console.log(_.pick(content, filter(keys, 'xmlns')));

      // let bigProperties = _.filter(keys, (key) => {
      //   let value = JSON.stringify(content[key]);
      //   return value.length > 5000;
      // });

      // console.log(bigProperties);

      // console.log('getAllPropertyPrefix', Filing.Parser.getAllPropertyPrefix(keys));

      // console.log(content['us-gaap:CommonStockDividendsPerShareDeclared']);
      // console.log(content['us-gaap:VariableInterestEntityDisclosureTextBlock']);

      // let results = filter(keys, 'Dividend');
      // console.log(results);
    })
    .catch(console.log);
}

// testParseFiling();

const parseXbrl = () => {
  const filingFile = `${__dirname}/../../resources/stocks/GM/files/10-K_2017-02-07.xml`;

  return Filing.Parser.parseXbrl(filingFile)
    .then(console.log)
    .catch(console.log);
}

// parseXbrl();

const Fundamentals = require('../../fundamentals');

const testFundamentals = () => {
  let document = fs.readFileSync(`${__dirname}/../../../resources/stocks/AAOI/filings/10-K_2017-03-09.json`);
  let json = JSON.parse(document);
  console.log(json.FundamentalAccountingConcepts);

  // (new Fundamentals.accounting.parse(json))
  //   .then(console.log)
  //   .catch(console.log);

  // return Filing.Parser.parse(`${__dirname}/../../../resources/stocks/GM/files/10-K_2017-02-07.xml`)
  //   .then(console.log)
  //   .catch(console.log);
};

testFundamentals()
