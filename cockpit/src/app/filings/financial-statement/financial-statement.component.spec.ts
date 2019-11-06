import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialStatementComponent } from './financial-statement.component';

describe('FinancialStatementComponent', () => {
  let component: FinancialStatementComponent;
  let fixture: ComponentFixture<FinancialStatementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinancialStatementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinancialStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
