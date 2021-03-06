import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';

import { StockService } from './stock.service';
import { StockMetricsTreeService } from './stock-metrics-tree/stock-metrics-tree.service';

import * as _ from 'lodash';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit, OnDestroy {

  public stock: any;
  public metrics: any;
  public historical: any[];

  private routeParamsSub: Subscription;
  private metricPathSub: Subscription;

  public paths: string[] = [
    'annual.EarningsPerShareDiluted',
    'annual.WeightedAverageNumberOfDilutedSharesOutstanding',
    'annual.CommonStockDividendsPerShareDeclared',
  ];

  constructor(private route: ActivatedRoute,
              private stockService: StockService,
              private metricsTree: StockMetricsTreeService) { }

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
            this.metrics = metrics[params.ticker];

            // this.updateChart('annual.EarningsPerShareBasic', 'EarningsPerShareBasic');
          });

        this.getHistoricalPrices(params.ticker);
      }
    });

    this.metricPathSub = this.metricsTree.metricPath.subscribe((metricPath: string) => {
      // console.log('metricPath', metricPath);
      this.paths.push(metricPath);
    });
  }

  ngOnDestroy() {
    this.routeParamsSub.unsubscribe();
    this.metricPathSub.unsubscribe();
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

  getHistoricalPrices(ticker: string) {
    this.stockService.getHistoricalPrices(ticker)
      .subscribe((historical: any[]) => {
        console.log(historical);
        this.historical = historical;
      });
  }

}
