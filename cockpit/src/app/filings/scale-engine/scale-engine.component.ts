import { Component, OnInit, OnChanges, Input } from '@angular/core';

import { ScaleEngineService } from './scale-engine.service';

import * as _ from 'lodash';

@Component({
  selector: 'sec-scale-engine',
  templateUrl: './scale-engine.component.html',
  styleUrls: ['./scale-engine.component.scss']
})
export class ScaleEngineComponent implements OnInit, OnChanges {

  @Input() metrics: any[] = [];

  public filenames: string[];
  public filename: string;
  public template: any;

  // TMP
  public report: any;
  public displayedColumns = ['description', 'category'];

  constructor(private engine: ScaleEngineService) { }

  ngOnInit() {
    this.getFiles();
    this.select('buffet');
  }

  ngOnChanges() {
    this.createReport();
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
        this.createReport();
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

  private createReport() {
    if(!this.report && this.metrics && this.template) {
      this.report = this.engine.createReport(this.metrics, this.template);
      console.log('report', this.report);
    }
  }

}
