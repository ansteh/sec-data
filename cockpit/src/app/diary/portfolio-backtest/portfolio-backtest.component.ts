import { Component, OnInit } from '@angular/core';

import { mergeMap } from 'rxjs/operators';

import { DiaryService } from './../diary.service';
import { PotfolioBacktestService } from './potfolio-backtest.service';

import { getPointData } from './backtest.util';

@Component({
  selector: 'sec-portfolio-backtest',
  templateUrl: './portfolio-backtest.component.html',
  styleUrls: ['./portfolio-backtest.component.scss']
})
export class PortfolioBacktestComponent implements OnInit {
  
  public snaphot: any;
  public snaphots: any = [];
  
  public point: any;
  public series: any[];
  
  constructor(
    private backtestService: PotfolioBacktestService,
    private diary: DiaryService
  ) { }

  ngOnInit() {
    this.backtest();
    
    // this.backtestService.backtest(["2021-02-23","2021-03-03"])
    //   .subscribe((result: any) => {
    //     console.log('result backtest:', result);
    //   });
  }
  
  backtest() {
    this.series = [];
    
    this.diary.getDays()
      .pipe(mergeMap(days => this.backtestService.backtest(days)))
      .subscribe((result: any) => {
        if(result) {
          console.log('backtest snaphot:', result);
          this.snaphots.push(result);
          this.snaphot = result;
          this.point = getPointData(this.snaphot);
          this.series.push(this.point);
          // this.series = this.series.slice(0);
        }
      });
  }

}
