import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

const apiUrl = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class FilingsService {

  constructor(private http: HttpClient) { }

  getBy(ticker: string): Observable<any> {
    return this.http.get(`${apiUrl}/filings/${ticker}`);
  }

}
