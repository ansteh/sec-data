import { Injectable } from '@angular/core';

import * as _ from 'lodash';

import { getCAGR, getUps, growthRate } from '../formulas/growth';
import { getStandardDeviation } from '../formulas/statsmodel';

const CATEGORIES = {
  "durable": 2,
  "tend to be durable": 1,
  "durable exceptions": 0,

  "tend to be medicore": -1,
  "medicore": -2,
  "highly competitive industry": -2,
  "fiercly competitive industry": -2,
};

const PROPERTIES = [
  "durable exceptions",
  "no sustainable competitive advantage",
  "highly competitive capital-intensive business",
  "earns interest",
  "exceptions (bank)",

  "highly competitive industry",
  "fiercly competitive industry",
];

const OPERATORS = {
  "<" : (value, threshold) => { return value <  threshold; },
  "<=": (value, threshold) => { return value <= threshold; },
  ">" : (value, threshold) => { return value >  threshold; },
  ">=": (value, threshold) => { return value >= threshold; }
};

const FUNCTIONS = {
  "CAGR": {
    label: "CAGR",
    formula: values => [getCAGR(values)],
  },
  "CAGR_MAX_20": {
    label: "CAGR (max. 20%)",
    formula: values => [getCAGR(values)],
  },
};

const TRENDS = {
  "TREND_UP": {
    label: "Upward Trend",
    formula: values => [getUps(values)],
  },
  "CONSISTENCY": {
    label: "Consistency",
    formula: values => [getStandardDeviation(values)],
  },
};

const align = (mapping) => {
  return _.map(mapping, (item, key) => {
    return Object.assign({ key }, item);
  });
};

const assignMatch = (clause) => {
  const match = OPERATORS[clause.operand];

  if(match) {
    clause.match = value => match(value, clause.value);
  }
};

const applyFormula = (property, scale, values) => {
  const key = scale[property];
  if(!key || !values) return values;

  const source = { prepare: FUNCTIONS, trend: TRENDS }[property];
  const formula = _.get(source, [key, 'formula']);

  if(formula) return formula(values);
};

const worstScore = _.min(_.values(CATEGORIES));

const getScore = (category) => {
  // return CATEGORIES[category];
  return category ? CATEGORIES[category] : worstScore;
};

const getScores = () => {
  return CATEGORIES;
};

export const CONTEXT = {
  categories: CATEGORIES,
  properties: PROPERTIES,
  operators: OPERATORS,
  functions: FUNCTIONS,
  trends: TRENDS,

  worstScore,

  applyFormula,
  assignMatch,
  getScore,
  getScores,
};

@Injectable({
  providedIn: 'root'
})
export class ScaleContextService {

  public scope: any = {
    categories: _.keys(CATEGORIES),
    properties: PROPERTIES,
    operators: _.keys(OPERATORS),
    functions: align(FUNCTIONS),
    trends: align(TRENDS),
  };

  constructor() { }
}
