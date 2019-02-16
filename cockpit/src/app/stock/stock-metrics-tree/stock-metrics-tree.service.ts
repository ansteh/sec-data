import { Injectable } from '@angular/core';

import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockMetricsTreeService {

  private metricPathSubject: Subject<string> = new Subject<string>();
  public metricPath: Observable<string> = this.metricPathSubject.asObservable();

  constructor() {
  }

  select(metricPath: string) {
    this.metricPathSubject.next(metricPath);
  }
}
