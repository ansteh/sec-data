import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Component({
  selector: 'sec-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {

  public view: string = 'composition';
  public loading: boolean = false;
  public series: any[];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getValuation();
  }

  getValuation() {
    this.loading = true;

    return this.http.get(`${environment.apiUrl}/portfolio/audit?view=${this.view}`)
      .pipe(finalize(() => { this.loading = false; }))
      .subscribe((series: any[]) => {
        this.series = series;
      });
  }

}
