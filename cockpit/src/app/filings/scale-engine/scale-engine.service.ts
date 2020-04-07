import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import * as Scale from './../metrics/scale';
import { CONTEXT } from './scale-context.service';

const apiUrl = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class ScaleEngineService {

  constructor(private http: HttpClient) { }

  getFiles(): Observable<any> {
    return this.http.get(`${apiUrl}/scale-engine/templates`);
  }

  getTemplate(name: string): Observable<any> {
    return this.http.get(`${apiUrl}/scale-engine/templates/${name}`);
  }

  saveTemplate(name: string, template: any): Observable<any> {
    return this.http.post(`${apiUrl}/scale-engine/templates/${name}`, template);
  }

  createReport(stock: any, template: any): any {
    return Scale.report(CONTEXT, stock, template);

    // const scales = Scale.report(CONTEXT, stock, template);
    //
    // return {
    //   scales,
    //   summary: Scale.summarize(scales)
    // };
  }
}
