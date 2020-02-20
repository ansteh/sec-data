import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaleDataSourceComponent } from './scale-data-source.component';

describe('ScaleDataSourceComponent', () => {
  let component: ScaleDataSourceComponent;
  let fixture: ComponentFixture<ScaleDataSourceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScaleDataSourceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleDataSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
