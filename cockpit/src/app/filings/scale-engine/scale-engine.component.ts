import { Component, OnInit, Input } from '@angular/core';

import { ScaleEngineService } from './scale-engine.service';

import * as _ from 'lodash';

@Component({
  selector: 'sec-scale-engine',
  templateUrl: './scale-engine.component.html',
  styleUrls: ['./scale-engine.component.scss']
})
export class ScaleEngineComponent implements OnInit {

  @Input() metrics: any[] = [];

  public templateName: string = 'buffet';
  public template: any;

  constructor(private engine: ScaleEngineService) { }

  ngOnInit() {
    this.getTemplate();
  }

  getTemplate(name?: string) {
    name = name || this.templateName;

    this.engine
      .getTemplate(name)
      .subscribe((template) => {
        this.template = template;
      });
  }

  saveTemplate(name?: string) {
    name = name || this.templateName;

    this.engine
      .saveTemplate(name, this.template)
      .subscribe((response) => {
        console.log('response', response);
      });
  }

}
