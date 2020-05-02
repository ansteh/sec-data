import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';

import * as Audit from './../audit';

@Component({
  selector: 'sec-portfolio-composition',
  templateUrl: './portfolio-composition.component.html',
  styleUrls: ['./portfolio-composition.component.scss']
})
export class PortfolioCompositionComponent implements OnInit, OnChanges {

  @Input() name: string;
  @Input() portfolio: any[] = [];

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
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.portfolio) {
      this.audit = Audit.createAudit(this.portfolio, this.name || 'Portfolio');
      // Audit.log(this.audit);
    }
  }
}
