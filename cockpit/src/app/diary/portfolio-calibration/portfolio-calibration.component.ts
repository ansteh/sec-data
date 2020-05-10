import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';

import * as Audit from './../audit';
import * as Portfolio from './../portfolio';
import * as Reports from './../../filings/metrics/reports';

import * as _ from 'lodash';

const assignDCFs = (position, years) => {
  const cagrs = _.get(position, 'stock.valuation.statements.cagrs');
  if(cagrs) {
    // console.log(Reports.getDCFs(cagrs));
    _.set(position, 'stock.valuation.dcfs', Reports.getDCFs(cagrs, years));
  }
};

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
  public orders: any = { fee: null, orders: null };

  public method: string = 'REBALANCE';
  private methods: any = {
    'REBALANCE': this.rebalance.bind(this),
    'OPPOSITION': this.createOpposition.bind(this),
  };

  public years: any = {
    value: 10,
    options: [5, 10],
  };

  constructor() { }

  ngOnInit() {
    // console.log('universe', this.universe);
    // console.log('portfolio', this.portfolio);
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.universe) {
      this.reset();
      // this.findOppisition();
    }
  }

  toggleMethod() {
    setTimeout(() => { this.reset(); });
  }

  setDCFs() {
    // TODO: fix: stock.fcf_mos is not updated
    console.log('years', this.years.value);
    this.setDCFsFor(this.portfolio);
    this.setDCFsFor(this.universe);
    this.reset();
  }

  private setDCFsFor(positions: any[]) {
    _.forEach(positions, pos => assignDCFs(pos, this.years.value));
  }

  private reset() {
    this.candidates = null;
    this.refreshOpposition();
  }

  private refreshOpposition() {
    this.methods[this.method]();
    this.getOrders();
  }

  remove(candidate: any) {
    // console.log(candidate, this.candidates);

    _.remove(this.candidates, (stock) => {
      return stock.ticker
        && candidate.ticker === _.last(stock.ticker.split(':'));
    });

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

  private findOppisition() {
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

  private getOrders() {
    this.orders = Portfolio.getOrders({
      current: Audit.createAudit(this.portfolio),
      target: Audit.createAudit(this.opposition),
    });

    console.log(this.orders);
  }

}
