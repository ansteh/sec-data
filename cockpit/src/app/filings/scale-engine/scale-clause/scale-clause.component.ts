import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

import * as _ from 'lodash';

@Component({
  selector: 'sec-scale-clause',
  templateUrl: './scale-clause.component.html',
  styleUrls: ['./scale-clause.component.scss']
})
export class ScaleClauseComponent implements OnInit, OnChanges {

  @Input() metrics: any[] = [];
  @Input() measure: any;

  constructor() { }

  ngOnInit() {
    console.log(this.measure);
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.measure) {
      if(this.measure) {
        this.measure.breadcumbs = this.measure.breadcumbs || [];
      }
    }
  }

  selectOperand(event) {
    console.log(event);
  }

  addClause() {
    this.measure.clauses.push({
      description: {
        label: null,
      }
    });
  }

  remove(clause) {
    _.pull(this.measure.clauses, clause);
  }

  selected(path: any[]) {
    console.log('ready path', path);
  }

}
