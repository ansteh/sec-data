import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';

import { ScaleContextService } from '../scale-context.service';

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

  public operators: string[];
  public categories: string[];
  public properties: string[];

  public selectableProperties: string[];

  constructor(private context: ScaleContextService) {
    this.operators = _.clone(this.context.scope.operators);
    this.categories = _.clone(this.context.scope.categories);
    this.properties = _.clone(this.context.scope.properties).sort();
  }

  ngOnInit() {
    // console.log(this.measure);
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.measure) {
      if(this.measure) {
        this.measure.breadcrumbs = this.measure.breadcrumbs || [];

        if(this.properties) {
          this.measure.clauses.forEach(clause => this.setProperties(clause));
        }
      }
    }
  }

  private setProperties(clause: any) {
    clause.properties = clause.properties || [];
    clause.selectableProperties = _.clone(this.properties);

    if(clause.properties.length > 0) {
      _.pullAll(clause.selectableProperties, clause.properties);
      clause.selectableProperties.sort();
    }
  }

  selectOperand(event) {
    // console.log(event);
  }

  selectProperty(clause, value) {
    clause.properties.push(value);
    clause.properties.sort();

    _.pull(clause.selectableProperties, value);
    clause.selectableProperties.sort();
  }

  removeProperty(clause, value) {
    clause.property = null;

    _.pull(clause.properties, value);
    clause.properties.sort();

    clause.selectableProperties.push(value);
    clause.selectableProperties.sort();
  }

  addClause() {
    const clause = {
      description: {
        label: null,
      }
    };

    this.setProperties(clause);
    this.measure.clauses.push(clause);
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

  selectMetric(data: any) {
    console.log('data', data);
    if(!this.measure.description.label) {
      this.measure.description.label = data.label;
    }
  }
}
