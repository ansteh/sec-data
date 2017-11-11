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

  @Input() data: any;

  private chart: Chart;

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
  }

  ngOnChanges() {
    if(this.chart && this.data) {
      this.chart.data = _.cloneDeep(this.data);
      this.chart.update();
    }
  }

}
