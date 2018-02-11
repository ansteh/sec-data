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
      .map((opportunities: any) => {

        const items = _
          .chain(_.values(opportunities))
          .sortBy(['params.margin', 'params.revenuesRate'])
          .reverse()
          .value();

        this.database.setData(items);

        const reference = _.first(items);
        if(reference) {
          this.columns = _.keys(_.get(reference, 'params'));
        } else {
          this.columns = [];
        }

        return opportunities;
      });
  }
}
