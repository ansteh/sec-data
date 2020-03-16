import { Component, OnInit } from '@angular/core';

import * as _ from 'lodash';

@Component({
  selector: 'sec-interpreter',
  templateUrl: './interpreter.component.html',
  styleUrls: ['./interpreter.component.scss']
})
export class InterpreterComponent implements OnInit {

  public header: any;
  public rows: any;
  public data: any;

  private schema: any  = [
    { property: 'name', label: "Name" },
    { property: 'ticker', label: "Full Ticker" },
    { property: 'price', label: "Stock Price (Current)" },
    { property: 'fairValue', label: "Fair Value (Finbox)" },
    { property: 'uncertainty', label: "Fair Value Uncertainty (Finbox Fair Value)" },
    { property: 'analystValue', label: "Fair Value (Analyst Target)" },
    { property: 'dividendYield', label: "Dividend Yield" },
    { property: 'adjustedPE', label: "P/E Ratio (Adjusted)" },
    { property: 'peg', label: "PEG Ratio" },
    { property: 'revenue_cagr_5', label: "Revenue CAGR (5y)" },
    { property: 'debtToEquity', label: "Debt / Equity" },
    { property: 'currentRatio', label: "Current Ratio" },
    { property: 'quickRatio', label: "Quick Ratio" },
  ];

  constructor() { }

  ngOnInit() {
  }

  handleCSV(rows) {
    // console.log('rows', rows);
    this.header = rows[0].map(value => _.trim(value, '"'));
    this.rows = this.prepareRows(rows);
    this.data = this.prepareData(rows);
  }

  private prepareRows(rows: any[]) {
    const header = _.first(rows);

    rows.shift();

    return _
      .chain(rows)
      .map((row) => {
        return _.map(row, (value) => {
          return this.extractNumber(value);
        }, {});
      })
      .value();
  }

  private extractNumber(value) {
    if(_.isString(value) === false) return value;

    if(value.indexOf('.')) {
      const candidate = parseFloat(value.trim());
      if(candidate.toString() === value) return candidate;
    }

    const integer = parseInt(value.trim());
    if(integer.toString() === value) return integer;

    return _.trim(value, '"');
  }

  private prepareData(rows) {
    return _.map(rows, (row) => {
      return _.reduce(this.schema, (item, { property }, index) => {
        return _.set(item, property, row[index]);
      }, {});
    });
  }

  private getCandidate() {
    return _
      .chain(this.data)
      .filter(item => item.fairValue > 0)
      .forEach((item) => {
        item.marginOfSafety = 1 - item.price/item.fairValue;
      })
      .filter(item => item.marginOfSafety > 0)
      .orderBy(['marginOfSafety'], ['desc'])
      .value();
  }

}
