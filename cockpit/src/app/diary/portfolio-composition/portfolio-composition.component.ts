import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';

import * as Audit from './../audit';

@Component({
  selector: 'sec-portfolio-composition',
  templateUrl: './portfolio-composition.component.html',
  styleUrls: ['./portfolio-composition.component.scss']
})
export class PortfolioCompositionComponent implements OnInit, OnChanges {

  @Input() name: string;
  @Input() portfolio: any[] = [];
  @Input() options: any;

  @Output() remove: any = new EventEmitter<any>();

  public audit: any;

  public displayedColumns = [
    'ticker',
    'price',
    'weight',
    'score',
    'value',
    'margin',
  ];

  constructor() { }

  ngOnInit() {
    if(this.options) {
      if(this.options.menu) this.displayedColumns.push('menu');
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.portfolio) {
      // console.log('create audit', this.portfolio.length);
      this.audit = Audit.createAudit(this.portfolio, this.name || 'Portfolio');
      // Audit.log(this.audit);
      // console.log(this.audit);
    }
  }

  formatPerc(value: number): number {
    return value ? 100 * value : value;
  }
}
