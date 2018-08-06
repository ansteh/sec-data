import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';

import { StockMarketService } from '../stock-market.service';
import { OpportunitiesDataSource } from './stock-opportunities.data-source';

import * as _ from 'lodash';

@Component({
  selector: 'sec-stock-opportunities',
  templateUrl: './stock-opportunities.component.html',
  styleUrls: ['./stock-opportunities.component.scss']
})
export class StockOpportunitiesComponent implements OnInit, OnDestroy {
  private routeParamsSub: Subscription;

  public date: Date;
  public opportunities: any[];

  public displayedColumns = [];
  public dataSource: OpportunitiesDataSource;

  constructor(private route: ActivatedRoute,
              private stockMarket: StockMarketService) { }

  ngOnInit() {
    this.dataSource = this.stockMarket.dataSource;

    this.routeParamsSub = Observable.combineLatest(this.route.params, this.route.queryParams)
      .subscribe(([params, queryParams]) => {
        if(params.date) {
          // console.log(params.date);
          // console.log(queryParams.portfolio);

          if(queryParams.portfolio) {
            this.stockMarket
              .getPortfolioBy(params.date)
              .subscribe((opportunities) => {
                this.displayedColumns = this.stockMarket.columns;
                this.opportunities = opportunities;
              });
          } else {
            this.stockMarket
              .getOpportunitiesBy(params.date)
              .subscribe((opportunities) => {
                this.displayedColumns = this.stockMarket.columns;
                this.opportunities = opportunities;
              });
          }
        }
      });
  }

  ngOnDestroy() {
    this.routeParamsSub.unsubscribe();
  }

  getStyleColor(column: string, row: any): string {
    if(column === 'margin') {
      const margin = _.get(row, 'params.margin');
      return margin >= 0 ? 'green' : 'red';
    }
  }

  allPositive(row: any): boolean {
    const values = _.values(_.get(row, 'params'));
    return _.every(values, x => x > 0);
  }

  isNumber(value: any): boolean {
    return _.isNumber(value);
  }
}
