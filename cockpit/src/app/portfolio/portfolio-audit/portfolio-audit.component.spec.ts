import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioAuditComponent } from './portfolio-audit.component';

describe('PortfolioAuditComponent', () => {
  let component: PortfolioAuditComponent;
  let fixture: ComponentFixture<PortfolioAuditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioAuditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
