import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendExaminationPreviewsComponent } from './trend-examination-previews.component';

describe('TrendExaminationPreviewsComponent', () => {
  let component: TrendExaminationPreviewsComponent;
  let fixture: ComponentFixture<TrendExaminationPreviewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrendExaminationPreviewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrendExaminationPreviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
