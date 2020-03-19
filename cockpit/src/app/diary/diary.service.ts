import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import * as _ from 'lodash';

const apiUrl = 'http://localhost:3000/api/diary';

@Injectable({
  providedIn: 'root'
})
export class DiaryService {

  constructor(private http: HttpClient) { }

  getDays(): Observable<any> {
    return this.http.get(`${apiUrl}/days`);
  }

  getSummary(day: string): Observable<any> {
    return this.http.get(`${apiUrl}/summary/${day}`);
  }
}
