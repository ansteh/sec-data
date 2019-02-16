import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { StocksService } from '../stocks.service';

@Component({
  selector: 'sec-create-stock',
  templateUrl: './create-stock.component.html',
  styleUrls: ['./create-stock.component.scss']
})
export class CreateStockComponent implements OnInit {

  public stock: any = {
    forms: {
      annual: '10-K',
      quarterly: '10-Q',
    },
  };

  constructor(private stocksService: StocksService, private router: Router) { }

  ngOnInit() {
  }

  fitAnnual() {
    if(this.stock.forms.quarterly === '10-Q') {
      this.stock.forms.annual = '10-K';
    }

    if(this.stock.forms.quarterly === '6-K') {
      this.stock.forms.annual = '20-F';
    }
  }

  fitQuarterly() {
    if(this.stock.forms.annual === '10-K') {
      this.stock.forms.quarterly = '10-Q';
    }

    if(this.stock.forms.annual === '20-F') {
      this.stock.forms.quarterly = '6-K';
    }
  }

  create() {
    this.stocksService.createStock(this.stock)
      .subscribe((body) => {
        console.log(body);
        this.router.navigate(['/stocks']);
      });
  }

}
