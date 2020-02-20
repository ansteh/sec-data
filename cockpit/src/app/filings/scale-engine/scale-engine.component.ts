import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'sec-scale-engine',
  templateUrl: './scale-engine.component.html',
  styleUrls: ['./scale-engine.component.scss']
})
export class ScaleEngineComponent implements OnInit {

  @Input() metrics: any[] = [];

  public measures: any[] = [];
  public measure: any;

  constructor() { }

  ngOnInit() {
    this.addMeasure();
  }

  addMeasure() {
    this.measure = this.createEmptyMeasure();
    this.measures.push(this.measure);
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

}
