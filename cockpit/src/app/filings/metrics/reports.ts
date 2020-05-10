import * as _ from 'lodash';

import { flatten } from './../filings';
import { getValues } from './util';
import { getCAGR } from './../formulas/growth';

import * as Dictionary from './dictionary';
import * as Pricing from './pricing';
import * as Scale from './scale';

import { CONTEXT } from './../scale-engine/scale-context.service';

export const createSummary = ({ ticker, template, stock }) => {
  const years = 10;
  const entities = flatten(stock);
  const { statements } = entities;
  const source = _.pick(entities, ['statements', 'margins']);
  const report: any = Scale.report(CONTEXT, source, template);

  report.dcfs = {
    longterm: Pricing.extractDCFs(statements, { years }),
    caped: Pricing.extractDCFs(statements, { years, maxGrowthRate: 0.2 }),
    midterm: Pricing.extractDCFs(statements, { years: 5, discountRate: 0.07, maxGrowthRate: 0.2 }),
  };

  const revenue = getValues('incomeStatement.revenue', statements);
  const dilutedEPS = getValues('incomeStatement.dilutedEPS', statements);
  const operatingEPS = Dictionary.getOperatingIncomePerShare(statements);
  const freeCashFlow = Dictionary.getFreeCashFlowPerShare(statements);

  report.statements = {
    cagrs: {
      deps: prepareCAGR(dilutedEPS),
      oeps: prepareCAGR(operatingEPS),
      fcf: prepareCAGR(freeCashFlow),
      revenue: prepareCAGR(revenue),
    },
  };

  return { ticker, stock, report };
};

const prepareCAGR = (series) => {
  return {
    rate: getCAGR(series),
    value: _.last(series),
  };
};

export const getDCFs = (cagrs, years = 10) => {
  return {
    longterm: Pricing.getDCFs(cagrs, { years }),
    caped: Pricing.getDCFs(cagrs, { years, maxGrowthRate: 0.2 }),
    midterm: Pricing.getDCFs(cagrs, { years: 5, discountRate: 0.07, maxGrowthRate: 0.2 }),
  };
};
