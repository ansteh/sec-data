import { Injectable } from '@angular/core';

import { from, Observable } from 'rxjs';
import { concatMap, mergeMap, map } from 'rxjs/operators';

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

import { getPointData } from './backtest.util';

@Injectable({
  providedIn: 'root'
})
export class PotfolioBacktestService {

  constructor(private diary: DiaryService) { }
  
  review(dates: string[]): Observable<any> {
    const years = 10;
        
    return from(dates)
      .pipe(
        concatMap((date: string) => {
          return this.diary.getSummary(date);
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
    
    const generate = (date: string, summary: Snapshot) => {
      if(!(portfolio || summary.portfolio)) return;
      
      summary.portfolio = portfolio || summary.portfolio;
      summary = Summary.prepare(summary);
      
      const current: any = {
        portfolio: Summary.setDCFs(summary.portfolio, years),
      };
      
      current.audit = Audit.createAudit(current.portfolio);
      
      // portfolio = Summary.setDCFs(summary.portfolio, years);
      // const audit = Audit.createAudit(portfolio);
      // console.log('backtest audit', audit);
      // console.log('backtest summary', summary);

      const universe = Summary.setDCFs(summary.stocks, years); // universe
      const candidates = _.shuffle(universe).filter(stock => stock.price > 0);
      
      const opposition: any = {};
      
      opposition.portfolio = Portfolio.create({
        budget: current.audit.value + 700,
        candidates,
        // count: 7,
      });
      
      opposition.portfolio = opposition.portfolio.map(({ count, stock }) => {
        return {
          count,
          stock,
          
          name: stock.name,
          ticker: _.last(stock.ticker.split(':')),
          value: stock.price * count,
        };
      });
      
      opposition.audit = Audit.createAudit(opposition.portfolio);
      
      const state = Object.assign({ date }, opposition);
      
      state.orders = Portfolio.getOrders({
        current: current.audit,
        target: opposition.audit,
      });
      
      portfolio = opposition.portfolio;
      
      return state;
    };
    
    const generateSnapshot = (date: string) => {
      return this.diary.getSummary(date)
        .pipe(map(summary => generate(date, summary)));
    };
    
    return from(dates)
      .pipe(
        concatMap(generateSnapshot)
      );
  }
  
  getChartData(snaphots: any[]): any {
    return snaphots.map(getPointData);
  }
  
}
