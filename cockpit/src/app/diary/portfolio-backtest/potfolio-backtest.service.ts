import { Injectable } from '@angular/core';

import { from, Observable } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

import { DiaryService } from './../diary.service';

import * as Audit from './../audit';
import * as Portfolio from './../portfolio';
import * as Reports from './../../filings/metrics/reports';
import * as Summary from './../summary';

export interface Snapshot {
  portfolio: any[];
  stocks: any[];
};

import * as _ from 'lodash';

const rebalance = ({ portfolio, candidates }) => {
  const audit = Audit.createAudit(portfolio);

  return Portfolio.create({
    budget: audit.value,
    candidates,
    // count: 7,
  });
};

const getOpposition = ({ portfolio, candidates }) =>  {
  
};

@Injectable({
  providedIn: 'root'
})
export class PotfolioBacktestService {

  constructor(private diary: DiaryService) { }
  
  review(dates: string[]): Observable<any> {
    const years = 10;
        
    return from(dates)
      .pipe(
        mergeMap((date: string) => {
          return this.getSummary(date);
        }),
        map((summary: Snapshot) => {
          const portfolio = Summary.setDCFs(summary.portfolio, years);
          const audit = Audit.createAudit(portfolio);
          
          return {
            audit,
            portfolio,
          };
        })
      );
  }
  
  backtest(dates: string[]): Observable<any> {
    const years = 10;
    const history = [];
    
    let portfolio;
    
    return from(dates)
      .pipe(
        mergeMap((date: string) => {
          return this.getSummary(date);
        }),
        map((summary: Snapshot) => {
          if(!(portfolio || summary.portfolio)) return;
          
          summary.portfolio = portfolio || summary.portfolio;
          summary = Summary.prepare(summary);
          
          portfolio = Summary.setDCFs(summary.portfolio, years);
          const audit = Audit.createAudit(portfolio);
          console.log('audit', audit);
          
          history.push({
            audit,
            portfolio,
          });

          const universe = Summary.setDCFs(summary.stocks, years); // universe
          const candidates = _.shuffle(universe);
          
          const opposition = Portfolio.create({
            budget: audit.value,
            candidates,
            // count: 7,
          });
          
          portfolio = opposition.map(({ count, stock }) => {
            return {
              count,
              name: stock.name,
              ticker: _.last(stock.ticker.split(':')),
              value: stock.price * count,
            };
          });
          
          return portfolio;
        })
      );
  }
  
  getSummary(date: string): Observable<any> {
    return this.diary.getSummary(date)
      // .pipe(map(Summary.prepare));
  }
  
}
