import { Component, OnInit, Input, OnChanges, SimpleChanges, Inject, LOCALE_ID } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import * as _ from 'lodash';

interface Column {
  label: string;
  property: string;
  type?: string;
}

@Component({
  selector: 'sec-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit, OnChanges {

  @Input() columns: Column[];
  @Input() dataSource: any[];
  @Input() displayedColumns: string[];

  constructor(private decimalPipe: DecimalPipe) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.columns && this.columns && !this.displayedColumns) {
      this.displayedColumns = this.columns.map(column => column.property);
    }
  }

  format(column: Column, value: any) {
    if(column.type === 'number' && _.isNumber(value)) {
      return this.decimalPipe.transform(value, '1.2-2');
    }

    return value;
  }

}
