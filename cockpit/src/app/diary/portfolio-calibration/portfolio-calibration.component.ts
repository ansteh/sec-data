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

  public candidates: any[] = null;
  public opposition: any[] = [];

  public method: string = 'REBALANCE';
  private methods: any = {
    'REBALANCE': this.rebalance.bind(this),
    'OPPOSITION': this.createOpposition.bind(this),
  };

  constructor() { }

  ngOnInit() {
    // console.log('universe', this.universe);
    // console.log('portfolio', this.portfolio);
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.universe) {
      this.rebalance();
      // this.findOppisition();
    }
  }

  toggleMethod() {
    setTimeout(() => {
      this.candidates = null;
      this.refreshOpposition();
    });
  }

  refreshOpposition() {
    this.methods[this.method]();
  }

  remove(candidate: any) {
    _.remove(this.candidates, { ticker: candidate.ticker });
    this.refreshOpposition();
  }

  private createOpposition() {
    const audit = Audit.createAudit(this.portfolio);
    this.candidates = this.candidates || this.universe;
    this.candidates = this.candidates.slice(0);

    this.opposition = Portfolio.create({
      budget: audit.value,
      candidates: this.candidates,
      // count: 7,
    });
  }

  private rebalance() {
    const audit = Audit.createAudit(this.portfolio);
    this.candidates = this.candidates || this.portfolio;
    this.candidates = this.candidates.slice(0);

    const candidates = _
      .chain(this.candidates)
      .map(position => position.stock)
      .filter(stock => stock && stock.ticker)
      .orderBy(['valuation.dcfs.longterm.fcf'], ['desc'])
      .value();

    this.opposition = Portfolio.create({
      budget: audit.value,
      candidates,
    });
  }

  findOppisition() {
    // console.log('this.universe', this.universe);
    const candidates = Audit.findHighestScoreCandidates(this.universe, 1000);
    console.log('findHighestScoreCandidates', candidates);

    this.method = 'OPPOSITION';
    const audit = Audit.createAudit(this.portfolio);
    this.candidates = this.candidates || this.universe;
    this.candidates = this.candidates.slice(0);

    this.opposition = Portfolio.create({
      budget: audit.value,
      candidates,
      // count: 7,
    });
  }

}
