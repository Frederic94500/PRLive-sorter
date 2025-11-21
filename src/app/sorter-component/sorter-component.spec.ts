import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SorterComponent } from './sorter-component';

describe('SorterComponent', () => {
  let component: SorterComponent;
  let fixture: ComponentFixture<SorterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SorterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SorterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
