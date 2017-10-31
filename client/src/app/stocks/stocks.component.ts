import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { StocksService } from './stocks.service';
import * as _ from 'lodash';

import { StocksDataSource } from './stocks.data-source';
import { Router } from '@angular/router';

@Component({
  selector: 'stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.scss']
})
export class StocksComponent implements OnInit {
  public displayedColumns = ['name', 'ticker', 'cik', 'annual'];
  public stocks: any;
  public dataSource: StocksDataSource;

  constructor(private router: Router, private stocksService: StocksService) { }

  ngOnInit() {
    this.dataSource = this.stocksService.dataSource;

    this.stocksService.getStocksFromResources()
      .subscribe((stocks) => {
        this.stocks = _.values(stocks);
      });
  }

  select(stock: any) {
    console.log(stock);
    this.router.navigate([`/stock/${stock.ticker}`]);
  }

}
