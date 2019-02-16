import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MetricsDatabase, OpportunitiesDataSource } from './stock-opportunities/stock-opportunities.data-source';

import { environment } from '../../environments/environment';

import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class StockMarketService {
  private database: MetricsDatabase;

  public dataSource: OpportunitiesDataSource;
  public columns: string[] = [];

  constructor(private http: HttpClient) {
    this.database = new MetricsDatabase();
    this.dataSource = new OpportunitiesDataSource(this.database);
  }

  getOpportunitiesBy(date: Date): Observable<any> {
    return this.http.get(`${environment.apiUrl}/share-market/${date}`)
      .pipe(
        map(stocks => _.filter(stocks, stock => this.hasSoundFundamentals(stock))),
        map(stocks => this.prepareOpportunities(stocks))
      )
  }

  getPortfolioBy(date: Date): Observable<any> {
    return this.http.get(`${environment.apiUrl}/share-market/portfolio/${date}`)
      .pipe(
        map(stocks => this.prepareOpportunities(stocks))
      )
  }

  private prepareOpportunities(opportunities: any): any {
    let [ withMargin, withoutMargin ] = _.partition(_.values(opportunities), stock => _.get(stock, 'params.margin'));

    withMargin = _
      .chain(withMargin)
      .sortBy(['params.margin', 'params.freeCashFlowMargin', 'params.PE', 'params.PB'])
      // .sortBy(['params.margin', 'params.ROE', 'params.ROA'])
      .reverse()
      .value();

    withoutMargin = _
      .chain(withoutMargin)
      .sortBy(['params.PE', 'params.PB'])
      .value();

    const items = [...withMargin, ...withoutMargin];

    this.database.setData(items);

    const reference = _.first(items);
    if(reference) {
      this.columns = ["ticker", "margin", "freeCashFlowMargin", "PE", "PB"];
      // this.columns = ["ticker", "margin", "PE", "PB", "ROE", "ROE%", "ROA", "ROA%", "CurrentRatio", "QuickRatio", "profit%", "revenues%", "NetCash%"];
      // this.columns = _.keys(_.get(reference, 'params'));
      // this.columns = ['ticker', ...this.columns];
    } else {
      this.columns = [];
    }

    return opportunities;
  }

  private hasSoundFundamentals(stock: any): boolean {
    return _.has(stock, 'params.margin')
      // && _.get(stock, 'params.margin') < 0.95
      && _.has(stock, 'params.PE')
      && _.get(stock, 'params.PE') > 0
      && _.has(stock, 'params.PB')
      // && _.has(stock, 'params.ROE')
  }

}
