import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StockOpportunitiesComponent } from './stock-opportunities.component';

describe('StockOpportunitiesComponent', () => {
  let component: StockOpportunitiesComponent;
  let fixture: ComponentFixture<StockOpportunitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StockOpportunitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StockOpportunitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
