import { Component, ElementRef, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';

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

    return Observable.merge(...displayDataChanges).map(() => {
      return this.database.data;
    });
  }

  disconnect() {}
}
