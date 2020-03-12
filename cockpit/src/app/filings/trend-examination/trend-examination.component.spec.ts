import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendExaminationComponent } from './trend-examination.component';

describe('TrendExaminationComponent', () => {
  let component: TrendExaminationComponent;
  let fixture: ComponentFixture<TrendExaminationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrendExaminationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrendExaminationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
