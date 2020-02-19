import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaleDataSelectComponent } from './scale-data-select.component';

describe('ScaleDataSelectComponent', () => {
  let component: ScaleDataSelectComponent;
  let fixture: ComponentFixture<ScaleDataSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScaleDataSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleDataSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
