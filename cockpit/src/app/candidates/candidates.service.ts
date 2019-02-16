import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CandidatesService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/candidates`)
  }

  update(stock: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/candidates`, stock)
  }
}
