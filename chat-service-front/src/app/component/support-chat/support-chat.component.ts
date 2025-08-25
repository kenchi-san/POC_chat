import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';

import { Conversation } from '../../interfaces/conversation';
import { ChatService } from '../../service/chat.service';
import { AuthService } from '../../service/AuthService';
import { Message } from '../../interfaces/message';

@Component({
  selector: 'app-support-chat',
  standalone: true,
  imports: [CommonModule, MatButtonModule, FormsModule, MatExpansionModule],
  templateUrl: './support-chat.component.html',
  styleUrls: ['./support-chat.component.scss']
})
export class SupportChatComponent implements OnInit {
  openConversations: Conversation[] = [];
  closedConversations: Conversation[] = [];
  private userId: string | null = null;

  constructor(
    private authService: AuthService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserIdFromToken();
    if (!this.userId) {
      console.error('Utilisateur non authentifié ou token invalide');
    }
  }

  toggleConversation(convo: Conversation) {
    convo.expanded = !convo.expanded;
  }

  sendMessage(convo: Conversation) {
    const text = (convo.newMessage || '').trim();
    if (!text) return;

    if (!this.userId) {
      console.error('Utilisateur non authentifié ou token invalide');
      return;
    }

    // Envoi au backend avec les vrais IDs
    this.chatService.sendMessage(convo.id, this.userId, text).subscribe({
      next: (resp: any) => {
        // Adapte la réponse API (createdAt) à ton modèle front (timestamp)
        const uiMsg: Message = {
          senderId: resp.senderId,
          conversationId:resp.conversationId,
          username: resp.username,
          content: resp.content,
          timestamp: resp.createdAt ? new Date(resp.createdAt) : new Date()
        };
        convo.messages.push(uiMsg);
        convo.newMessage = '';
      },
      error: err => console.error('Erreur envoi message', err)
    });
  }

  resolveConversation(convo: Conversation) {
    this.openConversations = this.openConversations.filter(c => c.id !== convo.id);
    this.closedConversations.push(convo);
  }
}
