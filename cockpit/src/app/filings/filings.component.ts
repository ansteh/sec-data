import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';

import { FilingsService } from './filings.service';

import * as _ from 'lodash';

import * as Cashflow from './formulas/cashflow';
import * as Discount from './formulas/discount-model';
import * as Earnings from './formulas/earnings';

import { createSeries, fakeSeries, getFilingView, flatten } from './filings';
import { growthRate } from './formulas/growth';

// TODO:
// chapter 19: net earnings durability
// chapter 20: net earnings per share

const createEntry = (statement) => {
  const rates = growthRate(statement.values);
  const values = statement.values.slice(0);

  const series = _.reduceRight(statement.dates, (series, date) => {
    series.unshift({
      date,
      change: rates.pop(),
      value: values.pop(),
    });

    return series;
  }, []);

  return {
    label: statement.label,
    values: series,
  };
};

@Component({
  selector: 'sec-filings',
  templateUrl: './filings.component.html',
  styleUrls: ['./filings.component.scss']
})
export class FilingsComponent implements OnInit {

  public summary: any;
  public view: any;
  public entities: any;

  public source: any;
  public statement: any;

  private routeParamsSub: Subscription;

  constructor(private route: ActivatedRoute, private filingsService: FilingsService) { }

  ngOnInit() {
    this.routeParamsSub = this.route.params.subscribe((params) => {
      console.log(params);
      if(params.ticker){
        this.filingsService.getBy(params.ticker)
          .subscribe((summary) => {
            this.summary = summary;
            this.view = getFilingView(summary);

            this.entities = flatten(summary);
            console.log('this.entities', this.entities);
            console.log('report', this.entities.report.margins.incomeStatement);
            this.source = _.pick(this.entities, ['statements', 'margins']);

            // this.statement = createSeries(this.entities, 'statements.incomeStatement.dilutedEPS');
            // this.statement = fakeSeries([1, 3, 9, 8, 4, -2], 'faker');
            // this.statement = fakeSeries([1,2,1,2,1,2,1,2,1,2], 'faker');
            this.statement = fakeSeries(_.shuffle([1,2,3,4,5,6,7,8,9,10]), 'faker');

            // const { dates, statements } = this.entities;
            // this.entryExample = createEntry(_.assign({ dates }, statements.incomeStatement.operatingIncome));

            // const discountedFreeChasFlow = Discount.getIntrinsicValue({
            //   value: 0.7,
            //   growthRate: 0.1,
            //   discountRate: 0.07,
            //   terminalRate: 0,
            //   years: 20,
            // });

            // const discountedFreeChasFlow = Discount.getIntrinsicValue({
            //   value: 30,
            //   growthRate: 0.07,
            //   discountRate: 0.11,
            //   terminalRate: 0.03,
            //   years: 5,
            // });

            // const discountedFreeChasFlow = Discount.getIntrinsicValue({
            //   value: 11.85,
            //   growthRate: 0.2,
            //   discountRate: 0.12,
            //   terminalRate: 0.04,
            //   years: 10,
            // });
            //
            // console.log('discountedFreeChasFlow', discountedFreeChasFlow);
            // console.log('view', this.view);
            //
            // console.log('free cash flow', Cashflow.getFreeCashFlow(this.view.dates, summary.filings));
            // console.log('free cash flow per share', Cashflow.getFreeCashFlowPerShare(this.view.dates, summary.filings));
            //
            // console.log('free cash flow discount', Cashflow.getDiscounts({
            //   dates: this.view.dates,
            //   filings: summary.filings,
            // }));
            //
            // console.log('earning discounts', Earnings.getDiscounts({
            //   dates: this.view.dates,
            //   filings: summary.filings,
            // }));
          });
      }
    });
  }

  ngOnDestroy() {
    this.routeParamsSub.unsubscribe();
  }

  private getFilings(ticker: string) {

  }
}
