import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioCompositionComponent } from './portfolio-composition.component';

describe('PortfolioCompositionComponent', () => {
  let component: PortfolioCompositionComponent;
  let fixture: ComponentFixture<PortfolioCompositionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioCompositionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioCompositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
