import { Component, OnInit } from '@angular/core';
import {ClientChatComponent} from '../../component/client-chat/client-chat.component';
import {SupportChatComponent} from '../../component/support-chat/support-chat.component';
import {AuthService} from '../../service/AuthService';

@Component({
  selector: 'app-chat-service',
  imports: [
    ClientChatComponent,
    SupportChatComponent
  ],
  templateUrl: './chat-service.component.html',
  styleUrl: './chat-service.component.scss'
})
export class ChatServiceComponent implements OnInit{
  role: string | null = null;

  constructor(private authService: AuthService) {
  }

  ngOnInit() {
    const token = this.authService.getToken();
    if (token) {
      const decoded: any = this.authService.decodeToken(token);
      this.role = decoded?.role || null;
    }
  }
}
