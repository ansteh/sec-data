import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { StockService } from './stock.service';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit, OnDestroy {
  public stock: any;
  private routeParamsSub: Subscription;

  constructor(private route: ActivatedRoute, private stockService: StockService) { }

  ngOnInit() {
    this.routeParamsSub = this.route.params.subscribe((params) => {
      if(params.ticker){
        this.stockService
          .findByTicker(params.ticker)
          .subscribe((stock) => {
            this.stock = stock;
          });
      }
    });
  }

  ngOnDestroy() {
    this.routeParamsSub.unsubscribe();
  }

  crawlAndDownload() {
    this.stockService
      .crawlAndDownload(this.stock.ticker)
      .subscribe((stock) => {
        this.stock = stock;
      });
  }

  parseFilings() {
    this.stockService
      .parseFilings(this.stock.ticker)
      .subscribe((res) => {
        console.log(res);
      });
  }

}
