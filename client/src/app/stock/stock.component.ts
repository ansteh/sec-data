import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import * as _ from 'lodash';

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

  public lineChartData: Array<any> = [
    {data: [], label: ''},
  ];
  public lineChartLabels:Array<any> = [];
  public lineChartOptions:any = {
    responsive: true
  };
  public lineChartColors:Array<any> = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend:boolean = true;
  public lineChartType:string = 'bar';

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
            this.metrics = metrics[params.ticker];

            this.updateChart('annual.EarningsPerShareBasic', 'EarningsPerShareBasic');
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

  updateChart(path: string, label: string) {
    let data = _.clone(_.get(this.metrics, path, []));
    data = _.reverse(data);

    this.setData(label, data);
    setTimeout(() => { this.setLabels(data); }, 0);
  }

  setLabels(data: any[] = []) {
    this.lineChartLabels =  _.map(data, 'endDate');
  }

  setData(label: string, data: any[] = []) {
    const values = _.map(data, 'value');
    const backgroundColor = this.getColors(values);

    this.lineChartData = [
      { data: values, label, backgroundColor},
    ];
  }

  getColors(values: any[] = []): any[] {
    return _.map(values, (value) => {
      if(value < 0) {
        return 'red';
      }

      return 'green';
    });
  }

  // events
  public chartClicked(e:any):void {
    console.log(e);
  }

  public chartHovered(e:any):void {
    console.log(e);
  }
}
