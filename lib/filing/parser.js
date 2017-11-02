const ParseXbrl = require('parse-xbrl');
const xmlParser = require('xml2json');
const _         = require('lodash');
const fs        = require('fs');
const Promise   = require('bluebird');

const gaap      = require('../modules/gaap');

const resourcePath = `${__dirname}/../../resources/`;

const parse = (filepath) => {
  return Promise.all([
    parseXbrl(filepath),
    parseFile(filepath).then(removeTextBlocks)
  ])
  .then(([FundamentalAccountingConcepts, json]) => {
    return Object.assign({ FundamentalAccountingConcepts }, json);
  })

  // return parseFile(filepath);
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

const trimXbrlKey = (key, json) => {
  const xbrlKey = json[`xbrli:${key}`] ? `xbrli:${key}` : key;
  const result = {};
  result[key] = json[xbrlKey];

  return result;
};

const prettifyPeriod = (original) => {
  const { instant } = trimXbrlKey('instant', original);

  if(instant) {
    return { instant };
  }

  const startDate = trimXbrlKey('startDate', original);
  const endDate = trimXbrlKey('endDate', original);

  return Object.assign({}, startDate, endDate);
};

const getPeriod = (context) => {
  const { period } = trimXbrlKey('period', context);

  return prettifyPeriod(period);
}

const parseExplicitMember = (ref) => {
  const entity = _.get(ref, 'xbrli:entity');
  const segment = _.get(entity, 'xbrli:segment');
  const member = _.get(segment, 'xbrldi:explicitMember');

  return _.get(member, '$t');
};

const prepareContext = (entry, filing, property) => {
  const { contextRef, $t, id } = entry;

  const context = filing['xbrli:context'] ? filing['xbrli:context'] : filing['context'];
  const ref = _.find(context, { id: contextRef });

  if(!context) {
    console.log('context empty!');
  }

  if(!ref) {
    console.log('Defined content not found!');
    return {};
  }

  const member = parseExplicitMember(ref) || property;
  // console.log(ref);

  let value;

  if(_.has(entry, 'xs:nil')) {
    value = 0;
  }

  if($t) {
    value = parseFloat($t);
  }

  return Object.assign({ property, member, value }, getPeriod(ref));
};

const defaultPrepare = _.curry((property, targets, filing) => {
  if(targets) {
    if(_.isPlainObject(targets)) {
      targets = [targets];
    }

    return targets.map(target => prepareContext(target, filing, property));
  }
});

//   Dividends: {
//     key: 'us-gaap:Dividends',
//     prepare: defaultPrepare('us-gaap:Dividends')
//   },

const createGaapMapping = () => {
  return _.reduce(gaap.PROPERTIES, (reducers, property) => {
    let key = `us-gaap:${property}`;
    _.set(reducers, property, { key, prepare: defaultPrepare(key) });

    return reducers;
  }, {});
};

const Mapping = createGaapMapping();

// CurrentFiscalYearEndDate: 'dei:CurrentFiscalYearEndDate',
// DocumentPeriodEndDate: 'dei:DocumentPeriodEndDate',

const find = _.curry((entry, filing) => {
  let mapping = Mapping[entry];

  if(!mapping) {
    // return defaultPrepare(entry, filing[entry], filing);
    return filing[entry];
  }

  if(_.isString(mapping)) {
    return filing[mapping];
  } else {
    let content = filing[mapping.key];
    return mapping.prepare(content, filing);
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
