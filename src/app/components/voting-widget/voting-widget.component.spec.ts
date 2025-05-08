import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotingWidgetComponent } from './voting-widget.component';

describe('VotingWidgetComponent', () => {
  let component: VotingWidgetComponent;
  let fixture: ComponentFixture<VotingWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VotingWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VotingWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
