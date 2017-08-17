const ParseXbrl = require('parse-xbrl');
const xmlParser = require('xml2json');
const _         = require('lodash');
const fs        = require('fs');
const Promise   = require('bluebird');

const resourcePath = `${__dirname}/../../resources/`;

const parse = (filepath) => {
  return Promise.all([
    parseXbrl(filepath),
    parseFile(filepath).then(removeTextBlocks)
  ])
  .then(([xbrl, json]) => {
    return Object.assign(xbrl, json);
  })
};

const parseXbrl = (filepath) => {
  return ParseXbrl.parse(filepath);
};

const parseFile = (filePath) => {
  return fs.readFileAsync(filePath, 'utf8')
    .then(xmlStr => xmlParser.toJson(xmlStr))
    .then((data) => {
      let jsonObj = JSON.parse(data);
      let documentJson = jsonObj[Object.keys(jsonObj)[0]];

      return documentJson;
    });
};

const getAllPropertyPrefix = (properties) => {
  return _
    .chain(properties)
    .map(property => _.first(property.split(':')))
    .uniq()
    .value();
};

const removeTextBlocks = (json) => {
  let properties = _
      .chain(_.keys(json))
      .filter(key => _.includes(key, 'TextBlock') === false)
      .filter(key => _.includes(key, 'Policy') === false)
      .filter(key => _.includes(key, 'us-gaap:UseOfEstimates') === false)
      .value();

  return _.pick(json, properties);
};

const Dividends = [
  'us-gaap:CommonStockDividendsPerShareCashPaid',
  'us-gaap:CommonStockDividendsPerShareDeclared'
];

const findDividends = (filing) => {
  let key = _.find(Dividends, (key) => {
    return _.has(filing, key);
  });

  if(key) {
    return filing[key];
  }
};

module.exports = {
  findDividends,
  getAllPropertyPrefix,
  parse,
  parseXbrl,
  parseFile,
  removeTextBlocks,
};
