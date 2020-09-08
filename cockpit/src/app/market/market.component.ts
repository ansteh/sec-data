import { Component, OnInit } from '@angular/core';

import * as Commit from './lib/commit';
import * as Portfolio from './lib/portfolio';
import * as Universe from './lib/universe';

@Component({
  selector: 'sec-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss']
})
export class MarketComponent implements OnInit {

  private universe: any;
  private portfolio: any;

  public positions: any[];

  constructor() { }

  ngOnInit() {
    // Commit.test();

    this.universe = Universe.createTestUnviverse();
    this.portfolio = Portfolio.createPortfolio(this.universe);

    this.portfolio.getPositions()
      .then(positions => console.log('positions', positions))
      .catch(console.log);

    this.portfolio.trade('NYSE:AAPL', 5)
      .then(position => console.log('result position', position))
      .catch(console.log);
  }

  private async getPositions(): Promise<void> {
    this.positions = this.portfolio.getPositions();
  }

}
