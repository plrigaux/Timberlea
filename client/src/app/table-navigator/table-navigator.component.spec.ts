import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableNavigatorComponent } from './table-navigator.component';

describe('TableNavigatorComponent', () => {
  let component: TableNavigatorComponent;
  let fixture: ComponentFixture<TableNavigatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableNavigatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableNavigatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
