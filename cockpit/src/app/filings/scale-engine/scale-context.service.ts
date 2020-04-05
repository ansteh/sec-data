import { Injectable } from '@angular/core';

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

const FUNCTIONS = [
  "CAGR",
  "CAGR (max. 20%)",
  "Upper Trend",
];

@Injectable({
  providedIn: 'root'
})
export class ScaleContextService {

  public scope: any = {
    categories: CATEGORIES,
    properties: PROPERTIES,
    operators: OPERATORS,
    functions: FUNCTIONS,
  };

  constructor() { }
}
