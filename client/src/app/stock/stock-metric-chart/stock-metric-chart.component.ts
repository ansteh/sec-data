import { Component, Input, OnChanges, OnInit, ViewChild, ElementRef } from '@angular/core';

import Chart from 'chart.js';
import * as _ from 'lodash';

@Component({
  selector: 'stock-metric-chart',
  templateUrl: './stock-metric-chart.component.html',
  styleUrls: ['./stock-metric-chart.component.css']
})
export class StockMetricChartComponent implements OnInit, OnChanges {
  @ViewChild('chart') canvas: ElementRef;

  @Input() metrics: any;
  @Input() path: any;

  private chart: Chart;
  private lineChartData: Array<any> = [
    {data: [], label: ''},
  ];
  private lineChartLabels:Array<any> = [];

  constructor() { }

  ngOnInit() {
    const ctx: CanvasRenderingContext2D = this.canvas.nativeElement.getContext('2d');

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {},
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero:true
            }
          }]
        }
      }
    });

    this.update();
  }

  ngOnChanges() {
    this.update();
  }

  private update() {
    if(this.chart && this.metrics && this.path) {
      console.log(this.path);

      const index = _.lastIndexOf(this.path, '.');
      const label = this.path.substr(index + 1);

      this.updateChart(this.path, label);

      this.chart.data = _.cloneDeep({
        labels: this.lineChartLabels,
        datasets: this.lineChartData
      });
      this.chart.update();
    }
  }

  private updateChart(path: string, label: string) {
    let data = this.extractData(path, label);

    this.setData(label, data);
    this.setLabels(data);
  }

  private extractData(path: string, label: string): any {
    let data;

    if(_.includes(path, 'FundamentalAccountingConcepts') === false) {
      data = _.clone(_.get(this.metrics, path, []));
    } else {
      path = _.replace(path, `.${label}`, '');

      data = _
        .chain(_.get(this.metrics, path, []))
        .map((filing) => {
          return {
            endDate: _.get(filing, 'DocumentPeriodEndDate'),
            value: _.get(filing, label),
          }
        })
        .value();
    }

    return data;
  }

  private setLabels(data: any[] = []) {
    this.lineChartLabels =  _.map(data, 'endDate');
  }

  private setData(label: string, data: any[] = []) {
    const values = _.map(data, 'value');
    const backgroundColor = this.getColors(values);

    this.lineChartData = [
      { data: values, label, backgroundColor},
    ];
  }

  private getColors(values: any[] = []): any[] {
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
