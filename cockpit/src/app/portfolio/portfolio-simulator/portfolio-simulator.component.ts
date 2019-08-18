import { Component, OnInit } from '@angular/core';

import { simulate, change, getRange } from '../tools/simulate';

import * as _ from 'lodash';

const power = _.curry((a, k, x) => {
  return a * Math.pow(x, -k);
});

// 96 books a year will sell more than 250000 copies => 96 * (250000/250000)^-1.5
// How many coopies will sell more than 500000 copies => 96 * (500000/250000)^-1.5
// How many coopies will sell more than 1000000 copies => 96 * (1000000/250000)^-1.5

// console.log(power(96, 1.5, 1));
// console.log(power(96, 1.5, 500000/250000));
// console.log(power(96, 1.5, 1000000/250000));

@Component({
  selector: 'sec-portfolio-simulator',
  templateUrl: './portfolio-simulator.component.html',
  styleUrls: ['./portfolio-simulator.component.scss']
})
export class PortfolioSimulatorComponent implements OnInit {

  public config: any = {
    years: 10,
    range: { min: 0.04, max: 0.72 },
    accurancy: 0.6,
    positions: 20,
  };

  public series: any[];

  constructor() { }

  ngOnInit() {
    this.sample();
  }

  sample() {
    const features = this.getFeatures();
    // console.log('features', features);

    this.series = simulate(features, this.config.years);
    // console.log(this.series);
  }

  private getFeatures() {
    return _
      .chain(_.times(this.config.positions, _.constant(0)))
      .map((x, index) => {
        // const { min, max } = this.config.range;
        const [min, max] = getRange(this.config.range.min, this.config.range.max);

        const next = (value) => {
          return change(value, _.random(min, max), 1 - this.config.accurancy);
        };

        const generator = { range: { min, max }, next, };

        return _.assign({ name: index, generator }, { commitment: 1000, netValue: 1000, rate: 1 });
      })
      .keyBy('name')
      .value();
  }

}
