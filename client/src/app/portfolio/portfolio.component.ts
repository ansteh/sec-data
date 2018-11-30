import { Component, OnInit } from '@angular/core';

import { Http } from '@angular/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'sec-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {

  public series: any[];

  constructor(private http: Http) { }

  ngOnInit() {
    this.getValuation();
  }

  getValuation() {
    return this.http.get(`${environment.apiUrl}/portfolio/audit`)
      .map(res => res.json())
      .subscribe((series: any[]) => {
        this.series = series;
      });
  }

}
