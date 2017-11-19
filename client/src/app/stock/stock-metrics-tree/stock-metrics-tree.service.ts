import { Injectable, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class StockMetricsTreeService {
  private metricPathSubject: Subject<string> = new Subject<string>();
  public metricPath: Observable<string> = this.metricPathSubject.asObservable();

  constructor() {
  }

  select(metricPath: string) {
    this.metricPathSubject.next(metricPath);
  }
}
