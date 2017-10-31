import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { StockService } from './stock.service';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit, OnDestroy {
  public stock: any;
  public metrics: any;
  private routeParamsSub: Subscription;

  constructor(private route: ActivatedRoute, private stockService: StockService) { }

  ngOnInit() {
    this.routeParamsSub = this.route.params.subscribe((params) => {
      if(params.ticker){
        this.stockService
          .findByTicker(params.ticker)
          .subscribe((stock) => {
            this.stock = stock;
          });

        this.stockService
          .getSummary(params.ticker)
          .subscribe((metrics) => {
            this.metrics = metrics;
          });
      }
    });
  }

  ngOnDestroy() {
    this.routeParamsSub.unsubscribe();
  }

  crawlAndDownload() {
    this.stockService
      .crawlAndDownload(this.stock.ticker)
      .subscribe((stock) => {
        this.stock = stock;
      });
  }

  parseFilings() {
    this.stockService
      .parseFilings(this.stock.ticker)
      .subscribe((res) => {
        console.log(res);
      });
  }

  summarize() {
    this.stockService
      .summarize(this.stock.ticker)
      .subscribe((metrics) => {
        console.log('summarize metrics', metrics);
        this.metrics = metrics;
      });
  }

}
