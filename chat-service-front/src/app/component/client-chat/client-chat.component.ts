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
  messages: Message[] = [];
  newMessage = '';
  conversationId: string | null = null;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserIdFromToken(); // récupère directement depuis le JWT
    if (!this.userId) {
      console.error('Utilisateur non authentifié ou token invalide');
      return;
    }
    this.loadMessages();
  }

  loadMessages(): void {
    if (!this.userId) return;

    this.chatService.getMessagesForUser().subscribe({
      next: (msgs) => {
        this.messages = msgs;
        if (msgs.length > 0) {
          this.conversationId = msgs[0].conversationId;
        }
      },
      error: (err) => console.error('Erreur récupération messages', err),
    });
  }


  sendMessage(): void {
    console.log(this.conversationId, this.userId, this.newMessage);

    if (!this.newMessage.trim() || !this.userId || !this.conversationId) return;

    this.chatService
      .sendMessage(this.conversationId, this.userId, this.newMessage)
      .subscribe({
        next: (msg: Message) => {
          this.messages.push(msg);
          this.newMessage = '';
          this.scrollToBottom();
        },
        error: (err) => console.error('Erreur envoi message', err),
      });
  }


  scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.messages');
      if (container) container.scrollTop = container.scrollHeight;
    }, 100);
  }
}
