import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

import { MetricsDatabase, OpportunitiesDataSource } from './stock-opportunities/stock-opportunities.data-source';

import * as _ from 'lodash';

import { Http } from '@angular/http';
import { environment } from '../../environments/environment';

@Injectable()
export class StockMarketService {
  private database: MetricsDatabase;

  public dataSource: OpportunitiesDataSource;
  public columns: string[] = [];

  constructor(private http: Http) {
    this.database = new MetricsDatabase();
    this.dataSource = new OpportunitiesDataSource(this.database);
  }

  getOpportunitiesBy(date: Date): Observable<any> {
    return this.http.get(`${environment.apiUrl}/share-market/${date}`)
      .map(res => res.json())
      .map(stocks => this.prepareOpportunities(stocks));
  }

  getPortfolioBy(date: Date): Observable<any> {
    return this.http.get(`${environment.apiUrl}/share-market/portfolio/${date}`)
      .map(res => res.json())
      .map(stocks => this.prepareOpportunities(stocks));
  }

  private prepareOpportunities(opportunities: any): any {
    const items = _
      .chain(_.values(opportunities))
      .filter((row) => {
        return _.has(row, 'params.margin')
          && _.get(row, 'params.margin') < 0.95
          && _.has(row, 'params.PE')
          && _.get(row, 'params.PE') > 0
          && _.has(row, 'params.PB')
          // && _.has(row, 'params.ROE')
      })
      .sortBy(['params.margin', 'params.PE', 'params.PB'])
      // .sortBy(['params.margin', 'params.ROE', 'params.ROA'])
      .reverse()
      .value();

    this.database.setData(items);

    const reference = _.first(items);
    if(reference) {
      this.columns = ["ticker", "margin", "PE", "PB"];
      // this.columns = ["ticker", "margin", "PE", "PB", "ROE", "ROE%", "ROA", "ROA%", "CurrentRatio", "QuickRatio", "profit%", "revenues%", "NetCash%"];
      // this.columns = _.keys(_.get(reference, 'params'));
      // this.columns = ['ticker', ...this.columns];
    } else {
      this.columns = [];
    }

    return opportunities;
  }

}
