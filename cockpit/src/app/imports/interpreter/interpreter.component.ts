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
    { property: 'freeCashFlow', label: "Levered Free Cash Flow" },
    { property: 'shares', label: "Weighted Average Diluted Shares Out." },
  ];

  constructor() { }

  ngOnInit() {
  }

  handleCSV(rows) {
    // console.log('rows', rows);
    this.header = rows[0].map(value => _.trim(value, '"'));
    this.rows = this.prepareRows(rows);
    this.data = this.prepareData(this.rows);
  }

  private prepareRows(data: any[]) {
    const rows = data.slice(0);
    rows.shift();
    return rows;
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
      .filter(item => item.currentRatio > 0.7)
      .filter(item => item.quickRatio > 0.7)
      .orderBy(['marginOfSafety'], ['desc'])
      .value();
  }

}
