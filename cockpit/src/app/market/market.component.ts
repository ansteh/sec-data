import { Component, OnInit } from '@angular/core';

import * as Commit from './lib/commit';
import * as Portfolio from './lib/portfolio';
import * as Trade from './lib/trade';
import * as Universe from './lib/universe';

Trade.test();

import { createEconomy } from './lib/economy/economy';
const economy = createEconomy({
  products: [
    {
      id: 1,
      name: 'product',
      currencyId: 1,
    }
  ]
});

// console.log(economy.addTransaction(1, 1, ));

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
    this.getPositions();

    this.portfolio.getPositions()
      .then(positions => console.log('positions', positions))
      .catch(console.log);

    this.portfolio.trade('NYSE:AAPL', 5)
      .then(position => console.log('result position', position))
      .catch(console.log);
  }

  private async getPositions(): Promise<void> {
    this.positions = await this.portfolio.getPositions();
  }

}
