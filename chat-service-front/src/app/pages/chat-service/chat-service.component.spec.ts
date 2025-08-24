import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatServiceComponent } from './chat-service.component';

describe('ChatServiceComponent', () => {
  let component: ChatServiceComponent;
  let fixture: ComponentFixture<ChatServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
