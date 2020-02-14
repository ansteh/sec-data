import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaleEngineComponent } from './scale-engine.component';

describe('ScaleEngineComponent', () => {
  let component: ScaleEngineComponent;
  let fixture: ComponentFixture<ScaleEngineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScaleEngineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
