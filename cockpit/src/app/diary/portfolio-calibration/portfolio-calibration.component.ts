import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';

import * as Audit from './../audit';
import * as Portfolio from './../portfolio';

import * as _ from 'lodash';

@Component({
  selector: 'sec-portfolio-calibration',
  templateUrl: './portfolio-calibration.component.html',
  styleUrls: ['./portfolio-calibration.component.scss']
})
export class PortfolioCalibrationComponent implements OnInit {

  @Input() name: string;
  @Input() portfolio: any[] = [];
  @Input() universe: any[] = [];

  public opposition: any[] = [];

  constructor() { }

  ngOnInit() {
    // console.log('universe', this.universe);
    // console.log('portfolio', this.portfolio);
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.universe) {
      this.createOpposition();
      // this.rebalance();
    }
  }

  private createOpposition() {
    const audit = Audit.createAudit(this.portfolio);

    this.opposition = Portfolio.create({
      budget: audit.value,
      candidates: this.universe,
      // count: 7,
    });
  }

  private rebalance() {
    const audit = Audit.createAudit(this.portfolio);

    const candidates = _
      .chain(this.portfolio)
      .map(position => position.stock)
      .filter(stock => stock && stock.ticker)
      .orderBy(['valuation.dcfs.longterm.fcf'], ['desc'])
      .value();

    this.opposition = Portfolio.create({
      budget: audit.value,
      candidates,
    });
  }

}
