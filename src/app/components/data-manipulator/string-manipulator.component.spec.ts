import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StringManipulatorComponent } from './string-manipulator.component';

describe('StringManipulatorComponent', () => {
  let component: StringManipulatorComponent;
  let fixture: ComponentFixture<StringManipulatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StringManipulatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StringManipulatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
