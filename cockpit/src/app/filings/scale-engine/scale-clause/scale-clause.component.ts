import { Component, OnInit } from '@angular/core';

import * as _ from 'lodash';

@Component({
  selector: 'sec-scale-clause',
  templateUrl: './scale-clause.component.html',
  styleUrls: ['./scale-clause.component.scss']
})
export class ScaleClauseComponent implements OnInit {

  public measure: any = {
    description: {
      label: null,
    },
    clauses: [
      {
        description: {
          label: null,
        }
      }
    ]
  };

  constructor() { }

  ngOnInit() {
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

}
