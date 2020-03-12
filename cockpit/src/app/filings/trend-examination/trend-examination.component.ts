import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

import Chart from 'chart.js';
import * as _ from 'lodash';
import { Trends } from '../../portfolio/tools/trends';

@Component({
  selector: 'sec-trend-examination',
  templateUrl: './trend-examination.component.html',
  styleUrls: ['./trend-examination.component.scss']
})
export class TrendExaminationComponent implements OnInit {

  @ViewChild('chart') canvas: ElementRef;

  @Input() statement: any;

  public data: any;
  public labels: any[] = [];
  public closes: any[] = [];

  private chart: Chart;
  private lineChartData: Array<any> = [
    {data: [], label: ''},
  ];
  private lineChartLabels:Array<any> = [];

  constructor() { }

  ngOnInit() {
    // const trends = Trends((point) => { return point; }, horizontals.statements.incomeStatement.dilutedEPS.values);
    // const trends = Trends((point) => { return point; }, [1.3, 2.16, 3.95, 6.31, 5.68, 6.45, 9.22, 8.31, 9.21, 11.91, 11.78]);
    // console.log('trends', trends);

    const ctx: CanvasRenderingContext2D = this.canvas.nativeElement.getContext('2d');

    this.chart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: this.labels,
				datasets: [{
					label: this.statement.label,
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
    this.data = this.statement.values,
    this.update();
  }

  private update() {
    if(!this.chart) return;

    this.labels = _.map(this.data, (point) => {
      return new Date(point.date);
    });

    this.closes = _.map(this.data, (point) => {
      return {
        x: new Date(point.date),
        y: point.value,
      };
    });

    const direction = [
      _.first(_.filter(this.closes, point => point.y)),
      _.last(_.filter(this.closes, point => point.y)),
    ];

    const trends = this.getTrendDatasets();
    const series = this.getStockDatasets();

    this.chart.data = _.cloneDeep({
      labels: this.labels,
      datasets: [{
        label: this.statement.label,
        data: this.closes,
        type: 'line',
        pointRadius: 0,
        fill: false,
        lineTension: 0,
        borderWidth: 2,
        backgroundColor: '#4285f4',
        borderColor: '#4285f4',
      }, /*{
        label: 'General',
        data: direction,
        type: 'line'
      },*/ ...trends] //, series
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
          x: new Date(point.date),
          y: point.value,
        };
      })
    };
  };

}
