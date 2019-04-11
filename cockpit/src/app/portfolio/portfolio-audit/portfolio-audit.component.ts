import { Component, Input, OnChanges, OnInit, ViewChild, ElementRef } from '@angular/core';

import Chart from 'chart.js';
import * as _ from 'lodash';
import { Trends } from '../tools/trends';
import { Interior } from '../tools/maxima';

@Component({
  selector: 'sec-portfolio-audit',
  templateUrl: './portfolio-audit.component.html',
  styleUrls: ['./portfolio-audit.component.scss']
})
export class PortfolioAuditComponent implements OnInit, OnChanges {

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
					label: "Portfolio",
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
        legend: {
          labels: {
            filter: function(item, chart) {
              return item.text;
            }
          }
        },
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
							labelString: 'Rate'
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
        y: point.rate
      };
    });

    const direction = [
      _.first(_.filter(this.closes, point => point.y)),
      _.last(_.filter(this.closes, point => point.y)),
    ];

    const trends = this.getTrendDatasets();
    const stocks = this.getStockDatasets();

    this.chart.data = _.cloneDeep({
      labels: this.labels,
      datasets: [{
        label: "Portfolio",
        data: this.closes,
        type: 'line',
        pointRadius: 0,
        fill: false,
        lineTension: 0,
        borderWidth: 2,
        backgroundColor: '#4285f4',
        borderColor: '#4285f4',
      }, {
        label: 'General',
        data: direction,
        type: 'line'
      }, ...trends, ...stocks]
    });

    this.chart.update();
  }

  private getTrendDatasets() {
    const down = {
      type: 'line',
      pointRadius: 0,
      fill: false,
      lineTension: 0,
      borderWidth: 2,
      backgroundColor: '#9b0000',
      borderColor: '#9b0000',
    };

    const upper = {
      type: 'line',
      pointRadius: 0,
      fill: false,
      lineTension: 0,
      borderWidth: 2,
      backgroundColor: '#48a999',
      borderColor: '#48a999',
    };

    const trends = Trends((point) => { return point.y; }, this.closes);

    return [
      ...trends.down.map((data) => { return _.assign({}, down, { data }); }),
      ...trends.upper.map((data) => { return _.assign({}, upper, { data }); }),
    ];
  }

  private getStockDatasets = () => {
    const tickers = _
    .chain(this.data)
    .first()
    .get('entries')
    .keys()
    .value();

    return _.map(tickers, (ticker) => {
      return {
        // label: ticker,
        type: 'line',
        pointRadius: 0,
        fill: false,
        lineTension: 0,
        borderWidth: 2,
        // backgroundColor: '#9b0000',
        // borderColor: '#9b0000',
        data: _.map(this.data, (point) => {
          return {
            x: new Date(_.get(point, `entries.${ticker}.date`)),
            y: _.get(point, `entries.${ticker}.rate`)
          };
        })
      };
    });
  };

}
