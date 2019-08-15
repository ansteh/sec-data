import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

import { simulate, change, getRange } from './tools/simulate';

import * as _ from 'lodash';

@Component({
  selector: 'sec-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {

  @Input() simulation: any;

  public view: string = 'composition';
  public loading: boolean = false;
  public series: any[];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getValuation();
  }

  getValuation() {
    if(this.simulation) {
      const features = _
        .chain(_.times(this.simulation.positions, _.constant(0)))
        .map((x, index) => {
          // const { min, max } = this.simulation.range;
          const [min, max] = getRange(this.simulation.range.min, this.simulation.range.max);

          const next = (value) => {
            return change(value, _.random(min, max), 1 - this.simulation.accurancy);
          };

          const generator = { range: { min, max }, next, };

          return _.assign({ name: index, generator }, { commitment: 1000, netValue: 1000, rate: 1 });
        })
        .keyBy('name')
        .value();

      // console.log('features', features);

      this.series = simulate(features, this.simulation.years);
      // console.log(this.series);
    } else {
      this.loading = true;

      return this.http.get(`${environment.apiUrl}/portfolio/audit?view=${this.view}`)
        .pipe(finalize(() => { this.loading = false; }))
        .subscribe((series: any[]) => {
          this.series = series;
        });
    }
  }

}
