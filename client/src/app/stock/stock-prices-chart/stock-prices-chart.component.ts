import { Component, Input, OnChanges, OnInit, ViewChild, ElementRef } from '@angular/core';

import Chart from 'chart.js';
import * as _ from 'lodash';

@Component({
  selector: 'sec-stock-prices-chart',
  templateUrl: './stock-prices-chart.component.html',
  styleUrls: ['./stock-prices-chart.component.css']
})
export class StockPricesChartComponent implements OnInit, OnChanges {
  @ViewChild('chart') canvas: ElementRef;

  @Input() data: any[];

  public labels: any[] = [];
  public closes: any[] = [];

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
			data: {
				labels: this.labels,
				datasets: [{
					label: "CHRT - Chart.js Corporation",
					data: this.closes,
					type: 'line',
					pointRadius: 0,
					fill: false,
					lineTension: 0,
					borderWidth: 2,
          backgroundColor: '#4285f4'
				}]
			},
			options: {
				scales: {
					xAxes: [{
						type: 'time',
						distribution: 'series',
						ticks: {
							source: 'auto'
						}
					}],
					yAxes: [{
						scaleLabel: {
							display: true,
							labelString: 'Closing price ($)'
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
    if(!this.data) return;

    this.labels = _.map(this.data, (point) => {
      return new Date(point.date);
    });

    this.closes = _.map(this.data, (point) => {
      return {
        x: new Date(point.date),
        y: point.close
      };
    });

    this.chart.data = _.cloneDeep({
      labels: this.labels,
      datasets: [{
        label: "CHRT - Chart.js Corporation",
        data: this.closes,
        type: 'line',
        pointRadius: 0,
        fill: false,
        lineTension: 0,
        borderWidth: 2,
        backgroundColor: '#4285f4',
        borderColor: '#4285f4',
      }]
    });

    this.chart.update();
  }

}
