import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';

import * as _ from 'lodash';

@Component({
  selector: 'sec-scale-clause',
  templateUrl: './scale-clause.component.html',
  styleUrls: ['./scale-clause.component.scss']
})
export class ScaleClauseComponent implements OnInit, OnChanges {

  @Input() metrics: any[] = [];
  @Input() measure: any;

  @Output() message: any = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    // console.log(this.measure);
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.measure) {
      if(this.measure) {
        this.measure.breadcrumbs = this.measure.breadcrumbs || [];
      }
    }
  }

  selectOperand(event) {
    // console.log(event);
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

  send() {
    this.message.emit(this.measure);
  }

  cancel() {
    this.message.emit(null);
  }

  validBreadcrumbs(): boolean {
    return _.has(_.get(this.metrics, this.measure.breadcrumbs), 'values');
  }

}
