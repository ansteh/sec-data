import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

import * as _ from 'lodash';
import { Trends } from './tools/trends';
import { Interior } from './tools/maxima';

@Component({
  selector: 'sec-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {

  public series: any[];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getValuation();
  }

  getValuation() {
    return this.http.get(`${environment.apiUrl}/portfolio/audit`)
      .subscribe((series: any[]) => {
        this.series = series;
        // console.log('peaks', Interior.findAllPeaks(_.map(this.series, 'rate')));
      });
  }

}
