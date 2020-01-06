import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';

import { FilingsService } from './filings.service';

import * as _ from 'lodash';

import * as Cashflow from './formulas/cashflow';
import * as Discount from './formulas/discount-model';
import * as Earnings from './formulas/earnings';

import { getFilingView, flatten } from './filings';

@Component({
  selector: 'sec-filings',
  templateUrl: './filings.component.html',
  styleUrls: ['./filings.component.scss']
})
export class FilingsComponent implements OnInit {

  public summary: any;
  public view: any;

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

            console.log(flatten(summary));
            // const discountedFreeChasFlow = Discount.getIntrinsicValue({
            //   value: 30,
            //   growthRate: 0.07,
            //   discountRate: 0.11,
            //   terminalRate: 0.03,
            //   years: 5,
            // });

            const discountedFreeChasFlow = Discount.getIntrinsicValue({
              value: 11.85,
              growthRate: 0.2,
              discountRate: 0.12,
              terminalRate: 0.04,
              years: 10,
            });

            console.log('discountedFreeChasFlow', discountedFreeChasFlow);
            console.log('view', this.view);

            console.log('free cash flow', Cashflow.getFreeCashFlow(this.view.dates, summary.filings));
            console.log('free cash flow per share', Cashflow.getFreeCashFlowPerShare(this.view.dates, summary.filings));

            console.log('free cash flow discount', Cashflow.getDiscounts({
              dates: this.view.dates,
              filings: summary.filings,
            }));

            console.log('earning discounts', Earnings.getDiscounts({
              dates: this.view.dates,
              filings: summary.filings,
            }));
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
