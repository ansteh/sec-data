import { Component, OnInit, Input, OnChanges } from '@angular/core';

import * as _ from 'lodash';
import { createSeries } from '../filings';

@Component({
  selector: 'sec-trend-examination-previews',
  templateUrl: './trend-examination-previews.component.html',
  styleUrls: ['./trend-examination-previews.component.scss']
})
export class TrendExaminationPreviewsComponent implements OnInit, OnChanges {

  @Input() entities: any;

  public metrics: any[];
  public breadcrumbs: any[] = [];
  public statement: any;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    if(this.entities) {
      this.metrics = _.pick(this.entities, ['statements', 'margins']);
      this.breadcrumbs = ['margins', 'balanceSheet', 'shortToLongDebtRatio'];
      this.setStatement();
    }
  }

  setStatement(event = null) {
    this.statement = createSeries(this.entities, this.breadcrumbs);
  }

}
