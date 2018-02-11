import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { StockMarketService } from '../stock-market.service';
import { OpportunitiesDataSource } from './stock-opportunities.data-source';

import * as _ from 'lodash';

@Component({
  selector: 'sec-stock-opportunities',
  templateUrl: './stock-opportunities.component.html',
  styleUrls: ['./stock-opportunities.component.css']
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

    this.routeParamsSub = this.route.params.subscribe((params) => {
      if(params.date){
        console.log(params.date);

        this.stockMarket
          .getOpportunitiesBy(params.date)
          .subscribe((opportunities) => {
            this.displayedColumns = this.stockMarket.columns;
            this.opportunities = opportunities;
          });
      }
    });
  }

  ngOnDestroy() {
    this.routeParamsSub.unsubscribe();
  }

}
