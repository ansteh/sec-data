import { Component, OnInit, Input } from '@angular/core';

import * as _ from 'lodash';

@Component({
  selector: 'sec-scale-template',
  templateUrl: './scale-template.component.html',
  styleUrls: ['./scale-template.component.scss']
})
export class ScaleTemplateComponent implements OnInit {

  @Input() metrics: any[] = [];

  public measures: any[] = [];
  public measure: any;

  constructor() { }

  ngOnInit() {
    this.addMeasure();
  }

  addMeasure() {
    this.measure = this.createEmptyMeasure();
  }

  private createEmptyMeasure() {
    return {
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
  }

  editMeasure(measure: any, index: number) {
    // console.log('editMeasure', measure, index);
    this.measure = _.cloneDeep(measure);
    this.measure.index = index;
  }

  updateMeasure(measure: any) {
    // console.log('updateMeasure', measure);

    if(measure) {
      if(measure.index > -1) {
        this.measures[measure.index] = measure;
      } else {
        this.measures.push(measure);
      }

      delete measure.index;
    }

    this.measure = null;
  }

}
