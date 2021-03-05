import { Component, OnInit } from '@angular/core';

import { PotfolioBacktestService } from './potfolio-backtest.service';

@Component({
  selector: 'sec-portfolio-backtest',
  templateUrl: './portfolio-backtest.component.html',
  styleUrls: ['./portfolio-backtest.component.scss']
})
export class PortfolioBacktestComponent implements OnInit {

  constructor(private backtestService: PotfolioBacktestService) { }

  ngOnInit() {
    this.backtestService.backtest(["2021-02-23","2021-03-03"])
      .subscribe((result: any) => {
        console.log('result', result);
      });
  }

}
