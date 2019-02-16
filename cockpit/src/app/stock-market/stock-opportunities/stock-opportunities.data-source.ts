import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';

import { merge } from 'rxjs';
import { map } from 'rxjs/operators';

export class MetricsDatabase {
  dataChange: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  get data(): any[] { return this.dataChange.value; }

  constructor() {

  }

  setData(data: any[]) {
    this.dataChange.next(data);
  }
}

export class OpportunitiesDataSource extends DataSource<any> {
  filterChange = new BehaviorSubject('');
  get filter(): string { return this.filterChange.value; }
  set filter(filter: string) { this.filterChange.next(filter); }

  constructor(private database: MetricsDatabase) {
    super();
  }

  connect(): Observable<any[]> {
    const displayDataChanges = [
      this.database.dataChange,
      this.filterChange,
    ];

    return merge(...displayDataChanges)
      .pipe(
        map(() => { return this.database.data;})
      );
  }

  disconnect() {}
}
