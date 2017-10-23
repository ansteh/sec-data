import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-stock',
  templateUrl: './create-stock.component.html',
  styleUrls: ['./create-stock.component.scss']
})
export class CreateStockComponent implements OnInit {

  public stock: any = { forms: {} };

  constructor() { }

  ngOnInit() {
  }

}
