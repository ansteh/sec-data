import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, forkJoin } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { flatten } from './../filings';
import * as Scale from './../metrics/scale';
import { CONTEXT } from './scale-context.service';

import * as _ from 'lodash';

const apiUrl = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class ScaleEngineService {

  constructor(private http: HttpClient) { }

  getFiles(): Observable<any> {
    return this.http.get(`${apiUrl}/scale-engine/templates`);
  }

  getTemplate(name: string): Observable<any> {
    return this.http.get(`${apiUrl}/scale-engine/templates/${name}`);
  }

  saveTemplate(name: string, template: any): Observable<any> {
    return this.http.post(`${apiUrl}/scale-engine/templates/${name}`, template);
  }

  createReport(stock: any, template: any): any {
    // this.createReports(template);
    return Scale.report(CONTEXT, stock, template);
  }

  createReports(template: any) {
    const getReport = (ticker) => {
      return this.http.get(`${apiUrl}/filings/${ticker}`)
        .pipe(map((stock) => {
          const entities = flatten(stock);
          const source = _.pick(entities, ['statements', 'margins']);
          const report = Scale.report(CONTEXT, source, template);

          return { ticker, stock, report };
        }));
    };

    const getReports = tickers => forkJoin(...tickers.map(getReport));

    this.getTickers().pipe(mergeMap(getReports))
      .subscribe((stocks: any[]) => {
        // console.log('stocks', stocks);

        const summary = _
          .chain(stocks)
          .map(({ ticker, report }) => {
            return {
              ticker,
              score: report.score.value,
              avg: report.score.avg,
            };
          })
          .orderBy(['score'], ['desc'])
          .value();

        console.log('summary', summary);
      });
  }

  private getTickers(): Observable<any> {
    return this.http.get(`${apiUrl}/scale-engine/filings`);
  }
}
