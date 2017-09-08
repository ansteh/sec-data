const fs        = require('fs');
const Filing    = require('../index.js');
const _         = require('lodash');

const filter = (stack, needle) => {
  needle = _.toLower(needle);
  return _.filter(stack, (str) => {
    return _.includes(_.toLower(str), needle);
  });
};

const filingFile = `${__dirname}/../../../resources/stocks/GM/files/10-K_2017-02-07.xml`;
//const filingFile = `${__dirname}/../../../resources/stocks/GM/files/10-K_2016-02-03.xml`;
//const filingFile = `${__dirname}/../../../resources/stocks/GM/files/10-K_2015-02-04.xml`;
//const filingFile = `${__dirname}/../../../resources/stocks/GM/files/10-K_2014-02-06.xml`;

const candidates = [
  // 'gm:BasisDifferencesResultingfromIndefinitelyReinvestedEarnings',
  // 'us-gaap:AntidilutiveSecuritiesExcludedFromComputationOfEarningsPerShareAmount',
  'us-gaap:EarningsPerShareBasic',
  'us-gaap:EarningsPerShareDiluted',
  // 'us-gaap:RetainedEarningsAccumulatedDeficit',
  // 'us-gaap:RetainedEarningsUndistributedEarningsFromEquityMethodInvestees',
];

const searchForProperties = () => {
  return Filing.Parser.parseFile(filingFile)
    .then((content) => {
      let keys = Object.keys(content);
      let matches = filter(keys, 'date');

      console.log(matches);

      _.forEach(candidates, (candidat) => {
        let target = {
          candidat,
          content: content[candidat]
        };

        // console.log(JSON.stringify(target, null, 2))
      });
    })
    .catch(console.log);
};

const testParseFiling = () => {
  return Filing.Parser.parseFile(filingFile)
    .then((content) => {
      // console.log(JSON.stringify(content, null, 2));
      // console.log(JSON.stringify(Filing.Parser.removeTextBlocks(content), null, 2));

      let keys = Object.keys(content);
      console.log('properties', keys.length);
      // console.log(keys);
      console.log(filter(keys, 'Earning'));

      //Seems to exists two possible definitions of dividends
      //console.log('DividendsAndRoyalties', content['gm:DividendsAndRoyalties']);
      // console.log('us-gaap:CommonStockDividendsPerShareCashPaid', content['us-gaap:CommonStockDividendsPerShareCashPaid']);
      // console.log('us-gaap:CommonStockDividendsPerShareDeclared', content['us-gaap:CommonStockDividendsPerShareDeclared']);
      //console.log('us-gaap:PaymentsOfDividends', content['us-gaap:PaymentsOfDividends']);

      // console.log('DividendsAndRoyalties', content['gm:DividendsAndRoyalties']);
      // console.log('DividendsCommonStock', content['us-gaap:DividendsCommonStock']);
      // console.log('us-gaap:PaymentsOfDividendsCommonStock', content['us-gaap:PaymentsOfDividendsCommonStock']);

      // console.log(_.pick(content, filter(keys, 'xmlns')));

      // console.log('getAllPropertyPrefix', Filing.Parser.getAllPropertyPrefix(keys));

      // console.log(content['us-gaap:CommonStockDividendsPerShareDeclared']);
      // console.log(content['us-gaap:VariableInterestEntityDisclosureTextBlock']);

      // let results = filter(keys, 'Dividend');
      // console.log(results);
    })
    .catch(console.log);
}

searchForProperties();
// testParseFiling();
