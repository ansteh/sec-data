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

    // TODO: fix: stock.fcf_mos is not updated
    const { stock } = position;
    if(stock.valuation) {
      const dcfs = stock.valuation.dcfs.longterm;
      if(dcfs.deps > 0) stock.deps_mos = 1 - stock.price/dcfs.deps;
      if(dcfs.oeps > 0) stock.oeps_mos = 1 - stock.price/dcfs.oeps;
      if(dcfs.fcf > 0) stock.fcf_mos = 1 - stock.price/dcfs.fcf;
    }
  }
};

const isStock = _.curry((ticker, stock) => {
  return stock.ticker && ticker === _.last(stock.ticker.split(':'));
});

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
  public alternates: any[] = [];
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
    // console.log('years', this.years.value);

    this.setDCFsFor(this.portfolio);
    this.portfolio = this.portfolio.slice(0); // force refresh

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
    this.refreshAlternates();
    this.getOrders();
  }

  private refreshAlternates() {
    const stocks = _
      .chain(this.opposition)
      .map('stock')
      .filter(stock => stock.ticker)
      .value();

    const source = this.method === 'REBALANCE'
      ? _.chain(this.portfolio).map('stock').filter().value()
      : this.universe;

    const alternates = _.difference(source, stocks);

    this.alternates = Portfolio.create({
      budget: 100000,
      candidates: alternates,
      count: alternates.length,
    });
  }

  remove(candidate: any) {
    // console.log(candidate, this.candidates);
    _.remove(this.candidates, isStock(candidate.ticker));
    this.refreshOpposition();
  }

  insert(candidate: any) {
    const source = this.method === 'REBALANCE' ? this.portfolio : this.universe;
    const stock = _.find(source, isStock(candidate.ticker));
    if(stock) this.candidates.push(stock);

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
    console.log(this.candidates);

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

  // private findOppisition() {
  //   // console.log('this.universe', this.universe);
  //   const candidates = Audit.findHighestScoreCandidates(this.universe, 1000);
  //   console.log('findHighestScoreCandidates', candidates);
  //
  //   this.method = 'OPPOSITION';
  //   const audit = Audit.createAudit(this.portfolio);
  //   this.candidates = this.candidates || this.universe;
  //   this.candidates = this.candidates.slice(0);
  //
  //   this.opposition = Portfolio.create({
  //     budget: audit.value,
  //     candidates,
  //     // count: 7,
  //   });
  // }

  private getOrders() {
    this.orders = Portfolio.getOrders({
      current: Audit.createAudit(this.portfolio),
      target: Audit.createAudit(this.opposition),
    });

    console.log(this.orders);
  }

}
