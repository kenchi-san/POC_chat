import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { Message } from '../../interfaces/message';
import { ChatService } from '../../service/chat.service';
import { AuthService } from '../../service/AuthService';
import { WebSocketService } from '../../service/websocket.service';

@Component({
  selector: 'app-client-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './client-chat.component.html',
  styleUrls: ['./client-chat.component.scss']
})
export class ClientChatComponent implements OnInit {
  userId: string | null = null;
  conversationId: string | null = null;
  messages: Message[] = [];
  newMessage = '';

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private wsService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserIdFromToken();
    if (!this.userId) {
      console.error('Utilisateur non authentifié ou token invalide');
      return;
    }

    this.loadMessages();
    this.wsService.connect();

    this.wsService.messages$.subscribe((msg: Message) => {
      if (msg && msg.conversationId === this.conversationId) {
        this.messages.push(msg);
        this.scrollToBottom();
      }
    });
  }

  loadMessages(): void {
    this.chatService.getMessagesForUser().subscribe({
      next: (msgs) => {
        this.messages = msgs;
        if (msgs.length > 0) {
          this.conversationId = msgs[0].conversationId;
          this.wsService.subscribeToConversation(this.conversationId);
        }
        this.scrollToBottom();
      },
      error: (err) => console.error('Erreur récupération messages', err),
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.userId || !this.conversationId) return;

    const decoded = this.authService.getDecodedToken();
    const email = decoded?.email || decoded?.sub || 'inconnu';

    this.wsService.sendClientMessage(
      this.conversationId,
      this.newMessage,
      email
    );

    this.newMessage = '';
  }


  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.messages');
      if (container) container.scrollTop = container.scrollHeight;
    }, 100);
  }
}
