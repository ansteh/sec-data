import { Component, OnInit } from '@angular/core';

import { CandidatesService } from './candidates.service';

import * as _ from 'lodash';

@Component({
  selector: 'sec-candidates',
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.css']
})
export class CandidatesComponent implements OnInit {

  public stocks: any[];

  constructor(private candidatesService: CandidatesService) { }

  ngOnInit() {

    this.candidatesService.getAll()
      .subscribe((stocks: any[]) => {
        this.stocks = stocks;
      });

  }

  update(stock: any) {
    this.candidatesService.update(_.pick(stock, ['cik', 'ticker']))
      .subscribe(() => {
        stock.saved = true;
      });
  }

}
