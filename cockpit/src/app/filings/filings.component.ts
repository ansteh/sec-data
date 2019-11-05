import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';

import { FilingsService } from './filings.service';

@Component({
  selector: 'sec-filings',
  templateUrl: './filings.component.html',
  styleUrls: ['./filings.component.scss']
})
export class FilingsComponent implements OnInit {

  public filings: any;
  private routeParamsSub: Subscription;

  constructor(private route: ActivatedRoute, private filingsService: FilingsService) { }

  ngOnInit() {
    this.routeParamsSub = this.route.params.subscribe((params) => {
      console.log(params);
      if(params.ticker){
        this.filingsService.getBy(params.ticker)
          .subscribe((filings) => { this.filings = filings; });
      }
    });
  }

  ngOnDestroy() {
    this.routeParamsSub.unsubscribe();
  }

  private getFilings(ticker: string) {

  }
}
