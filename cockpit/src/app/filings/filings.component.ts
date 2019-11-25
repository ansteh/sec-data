import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';

import { FilingsService } from './filings.service';

import * as _ from 'lodash';

import * as Discount from './formulas/discount-model';

const getFilingView = (context: any) => {
  const dates = getDates(context);

  if(dates.length > 0) {
    const filing = context.filings[dates[0].date];

    return {
      dates,
      incomeStatement: _.keys(filing.incomeStatement),
      balanceSheet: _.keys(filing.balanceSheet),
      cashflowStatement: _.keys(filing.cashflowStatement),
    };
  }
};

const getDates = (context: any) => {
  return _.map(context.filings, (filing, date) => {
    return { date, LTM: _.get(filing, 'LTM') };
  });
};

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

            const discountedFreeChasFlow = Discount.getIntrinsicValue({
              value: 30,
              growthRate: 0.07,
              discountRate: 0.11,
              terminalRate: 0.03,
              years: 5,
            });

            console.log('discountedFreeChasFlow', discountedFreeChasFlow);
            console.log('view', this.view);

            console.log('free cash flow', Discount.getFreeCashFlow(this.view.dates, summary.filings));
            console.log('free cash flow per share', Discount.getFreeCashFlowPerShare(this.view.dates, summary.filings));
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
