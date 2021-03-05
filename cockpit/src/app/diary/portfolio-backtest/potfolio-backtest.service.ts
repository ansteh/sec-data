import { Injectable } from '@angular/core';

import { from, Observable } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

import { DiaryService } from './../diary.service';

import * as Audit from './../audit';
import * as Portfolio from './../portfolio';
import * as Reports from './../../filings/metrics/reports';
import * as Summary from './../summary';

import * as _ from 'lodash';

const rebalance = ({ portfolio, candidates }) => {
  console.log({ portfolio, candidates });
  
  const audit = Audit.createAudit(portfolio);

  return Portfolio.create({
    budget: audit.value,
    candidates,
    // count: 7,
  });
};

@Injectable({
  providedIn: 'root'
})
export class PotfolioBacktestService {

  constructor(private diary: DiaryService) { }
  
  backtest(dates: string[]): Observable<any> {
    return from(dates)
      .pipe(
        mergeMap((date: string) => {
          return this.getSummary(date);
        }),
        map((summary) => {
          return Audit.createAudit(summary.portfolio);
        })
      );
  }
  
  getSummary(date: string): Observable<any> {
    return this.diary.getSummary(date)
      .pipe(map(Summary.prepare));
  }
  
}
