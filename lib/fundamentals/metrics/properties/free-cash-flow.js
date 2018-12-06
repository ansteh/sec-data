const _ = require('lodash');

const fundamentals = require('../fundamentals');

const getFreeCashFlow = (filings) => {
  const NetCashFlowsOperating = fundamentals.get(filings, 'NetCashFlowsOperating');
  const PaymentsToAcquirePropertyPlantAndEquipment = _.get(filings, 'PaymentsToAcquirePropertyPlantAndEquipment');

  // console.log(NetCashFlowsOperating);
  // console.log(PaymentsToAcquirePropertyPlantAndEquipment);

  return _
    .chain(NetCashFlowsOperating)
    .map(({ NetCashFlowsOperating, DocumentPeriodEndDate }, index) => {
      const capex = _.find(PaymentsToAcquirePropertyPlantAndEquipment, { endDate: DocumentPeriodEndDate });

      if(_.has(capex, 'value')) {
        return {
          value: NetCashFlowsOperating - capex.value,
          endDate: DocumentPeriodEndDate
        };
      }
    })
    .filter(_.identity)
    .value();
};

module.exports = {
  getFreeCashFlow,
};
