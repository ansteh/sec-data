import { Injectable } from '@angular/core';
import * as _ from 'lodash';

const CATEGORIES = [
  "durable",
  "tend to be durable",
  "durable exceptions",

  "tend to be medicore",
  "medicore",
  "highly competitive industry",
  "fiercly competitive industry",
];

const PROPERTIES = [
  "durable exceptions",
  "no sustainable competitive advantage",
  "highly competitive capital-intensive business",
  "earns interest",
  "exceptions (bank)",

  "highly competitive industry",
  "fiercly competitive industry",
];

const OPERATORS = [
  "<",
  "<=",
  ">",
  ">=",
];

const FUNCTIONS = {
  "CAGR": {
    label: "CAGR",
    prepare: null,
  },
  "CAGR_MAX_20": {
    label: "CAGR (max. 20%)",
    prepare: null,
  }, //:"CAGR (max. 20%)"
};

const TRENDS = {
  "TREND_UP": {
    label: "Upward Trend",
    prepare: null,
  },
};

const align = (mapping) => {
  return _.map(mapping, (item, key) => {
    return Object.assign({ key }, item);
  });
};

@Injectable({
  providedIn: 'root'
})
export class ScaleContextService {

  public scope: any = {
    categories: CATEGORIES,
    properties: PROPERTIES,
    operators: OPERATORS,
    functions: align(FUNCTIONS),
    trends: align(TRENDS),
  };

  constructor() { }
}
