import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';

import * as Audit from './../audit';
import * as Portfolio from './../portfolio';

@Component({
  selector: 'sec-portfolio-calibration',
  templateUrl: './portfolio-calibration.component.html',
  styleUrls: ['./portfolio-calibration.component.scss']
})
export class PortfolioCalibrationComponent implements OnInit {

  @Input() name: string;
  @Input() portfolio: any[] = [];
  @Input() universe: any[] = [];

  public opposition: any[] = [];

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.universe) {
      this.createOpposition();
    }
  }

  private createOpposition() {
    const audit = Audit.createAudit(this.portfolio);

    this.opposition = Portfolio.create({
      candidates: this.universe,
      budget: audit.value,
      // count: 7,
    });
  }

}
