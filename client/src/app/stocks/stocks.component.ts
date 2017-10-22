import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { StocksService } from './stocks.service';

@Component({
  selector: 'stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent implements OnInit {
  public stocks: any;

  constructor(private stocksService: StocksService) { }

  ngOnInit() {
    this.stocksService.getStocksFromResources()
      .subscribe((stocks) => {
        this.stocks = stocks;
      });
  }

}
