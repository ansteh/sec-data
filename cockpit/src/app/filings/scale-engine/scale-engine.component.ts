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

  public filenames: string[];
  public filename: string;
  public template: any;
  public report: any;

  constructor(private engine: ScaleEngineService) { }

  ngOnInit() {
    this.getFiles();
    this.select('buffet');
  }

  select(name) {
    this.filename = name;
    this.getTemplate();
  }

  getTemplate(name?: string) {
    name = name || this.filename;

    this.engine
      .getTemplate(name)
      .subscribe((template) => {
        this.template = template;

        this.report = this.engine.createReport(this.metrics, template);
        console.log('report', this.report);
      });
  }

  saveTemplate(name?: string) {
    name = name || this.filename;

    this.engine
      .saveTemplate(name, this.template)
      .subscribe((response) => {
        console.log('response', response);
      });
  }

  getFiles() {
    this.engine
      .getFiles()
      .subscribe((filenames) => {
        this.filenames = filenames;
      });
  }

}
