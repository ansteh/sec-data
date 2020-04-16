import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, forkJoin } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { flatten } from './../filings';
import * as Pricing from './../metrics/pricing';
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
    // this.createReports(template)
    //   .pipe(map(content => JSON.stringify(content, null, 2)))
    //   .subscribe(console.log);

    return Scale.report(CONTEXT, stock, template);
  }

  createReports(template: any): Observable<any> {
    const getReport = (ticker) => {
      return this.http.get(`${apiUrl}/filings/${ticker}`)
        .pipe(map((stock) => {
          const entities = flatten(stock);
          const source = _.pick(entities, ['statements', 'margins']);
          const report: any = Scale.report(CONTEXT, source, template);
          report.dcfs = Pricing.getDCFs(entities.statements);

          return { ticker, stock, report };
        }));
    };

    const getReports = tickers => forkJoin(...tickers.map(getReport));

    const createScores = (stocks: any[]) => {
      // console.log('stocks', stocks);

      return _
        .chain(stocks)
        .map(({ ticker, report }) => {
          return {
            ticker,
            score: report.score.value,
            avg: report.score.avg,
            dcfs: report.dcfs,
          };
        })
        .orderBy(['score'], ['desc'])
        .value();
    };

    return this.getTickers().pipe(mergeMap(getReports), map(createScores));
  }

  private getTickers(): Observable<any> {
    return this.http.get(`${apiUrl}/scale-engine/filings`);
  }

  getScoresBy(name: string): Observable<any> {
    return this.getTemplate(name).pipe(mergeMap(template => this.createReports(template)));
  }
}
