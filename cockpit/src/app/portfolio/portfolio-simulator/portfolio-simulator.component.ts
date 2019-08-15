import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'sec-portfolio-simulator',
  templateUrl: './portfolio-simulator.component.html',
  styleUrls: ['./portfolio-simulator.component.scss']
})
export class PortfolioSimulatorComponent implements OnInit {

  public config: any = {
    years: 10,
    range: { min: 0.04, max: 0.72 },
    accurancy: 0.6,
    positions: 20,
  };

  constructor() { }

  ngOnInit() {
  }

}
