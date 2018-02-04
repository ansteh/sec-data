import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { StockMarketService } from '../stock-market.service';

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

  constructor(private route: ActivatedRoute,
              private stockMarket: StockMarketService) { }

  ngOnInit() {
    this.routeParamsSub = this.route.params.subscribe((params) => {
      if(params.date){
        console.log(params.date);

        this.stockMarket
          .getOpportunitiesBy(params.date)
          .subscribe((opportunities) => {
            this.opportunities = opportunities;
          });
      }
    });
  }

  ngOnDestroy() {
    this.routeParamsSub.unsubscribe();
  }

}
