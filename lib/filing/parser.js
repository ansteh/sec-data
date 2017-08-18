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

const Mapping = {
  Dividends: [
    'us-gaap:CommonStockDividendsPerShareCashPaid',
    'us-gaap:CommonStockDividendsPerShareDeclared'
  ],
  EarningsPerShareBasic: 'us-gaap:EarningsPerShareBasic',
  EarningsPerShareDiluted: 'us-gaap:EarningsPerShareDiluted',
}

const find = _.curry((entry, filing) => {
  let mapping = Mapping[entry];

  if(!mapping) return;

  if(_.isArray(mapping)) {
    return findByMapping(mapping, filing);
  } else if(_.isString(mapping)) {
    return filing[mapping];
  }
});

const findByMapping = (mapping, filing) => {
  let key = _.find(mapping, (key) => {
    return _.has(filing, key);
  });

  if(key) {
    return filing[key];
  }
};

module.exports = {
  find,
  getAllPropertyPrefix,
  parse,
  parseXbrl,
  parseFile,
  removeTextBlocks,
};
