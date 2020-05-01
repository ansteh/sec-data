import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'sec-portfolio-composition',
  templateUrl: './portfolio-composition.component.html',
  styleUrls: ['./portfolio-composition.component.scss']
})
export class PortfolioCompositionComponent implements OnInit {

  @Input() stocks: any[] = [];

  public displayedColumns = [
    'ticker',
    'weight',
    'score',
    'value',
    'margin',
  ];

  constructor() { }

  ngOnInit() {
  }

}
