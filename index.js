const ParseXbrl = require('parse-xbrl');
const got       = require('got');
const fs        = require('fs');
const xmlParser = require('xml2json');
const _         = require('lodash');
const cheerio = require('cheerio')

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
// parse('gm-10-Q-2016.xml');

const parseFile = (filename) => {
  const filePath = `${__dirname}/resources/${filename}`;

  return fs.readFileAsync(filePath, 'utf8')
    .then(xmlStr => xmlParser.toJson(xmlStr));
}

const filter = (stack, needle) => {
  needle = _.toLower(needle);
  return _.filter(stack, (str) => {
    return _.includes(_.toLower(str), needle);
  });
};

// parseFile('gm-10-Q-2016.xml')
//   .then((data) => {
//     // console.log(JSON.stringify(data, null, 2));
//     let jsonObj = JSON.parse(data);
//     let documentJson = jsonObj[Object.keys(jsonObj)[0]];
//
//     let keys = Object.keys(documentJson);
//     // console.log(keys.length);
//     // console.log(JSON.stringify(keys, null, 2));
//
//     console.log(documentJson['us-gaap:CommonStockDividendsPerShareDeclared']);
//
//     // let results = filter(keys, 'Dividend');
//     // console.log(results);
//   })
//   .catch(console.log);

// got('https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001467858&type=10-K&dateb=&owner=include&count=40')
//     .then(response => {
//         // console.log(response.body);
//         const $ = cheerio.load(response.body);
//         console.log($('table[summary=Results]').html())
//     })
//     .catch(error => {
//         console.log(error.response.body);
//         //=> 'Internal server error ...'
//     });

const saveExmple = () => {
  let sourceUrl = 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001467858&type=10-K&dateb=&owner=include&count=40';
  got.stream(sourceUrl).pipe(fs.createWriteStream(`${__dirname}/resources/example.html`));
}

const crawlFillings = (document) => {
  // console.log(document);
  const $ = cheerio.load(document);
  let table = $('table[summary=Results]');

  let rows = table.find('tr');
  let result = _.map(rows, (row, index) => {
    if(index === 0) {
      return parseHeader($, row);
    }
    return parseRow($, row);
  });
  console.log(result);
}

const parseHeader = ($, header) => {
  return _.map($(header).find('th'), (column) => {
    return $(column).text();
  });
}

const parseRow = ($, filling) => {
  return _.map($(filling).find('td'), (column, index) => {
    let target = $(column);
    if(index === 1) {
      return target.find('a[id=documentsbutton]').attr('href')
    }
    return target.text();
  });
}

const testCrawler = () => {
  let document = fs.readFileSync(`${__dirname}/resources/example.html`)
  crawlFillings(document);
};

testCrawler();
