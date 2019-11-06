import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'sec-financial-statement',
  templateUrl: './financial-statement.component.html',
  styleUrls: ['./financial-statement.component.scss']
})
export class FinancialStatementComponent implements OnInit {

  @Input() summary: any;
  @Input() view: any;
  @Input() statement: string;

  constructor() { }

  ngOnInit() {
  }

}
