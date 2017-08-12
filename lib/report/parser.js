const ParseXbrl = require('parse-xbrl');
const xmlParser = require('xml2json');
const _         = require('lodash');
const fs        = require('fs');

const resourcePath = `${__dirname}/../../resources/`;

const parseXbrl = (filename) => {
  return ParseXbrl.parse(`${resourcePath}${filename}`);
};

const parseFile = (filename) => {
  const filePath = `${resourcePath}${filename}`;

  return fs.readFileAsync(filePath, 'utf8')
    .then(xmlStr => xmlParser.toJson(xmlStr));
};

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

module.exports = {
  parseXbrl,
};
