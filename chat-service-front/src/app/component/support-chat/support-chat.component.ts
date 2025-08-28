import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

import { Conversation } from '../../interfaces/conversation';
import { Messages_support } from '../../interfaces/messages_support';
import { AuthService } from '../../service/AuthService';
import { ChatService } from '../../service/chat.service';
import { WebSocketService } from '../../service/websocket.service';

@Component({
  selector: 'app-support-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatExpansionModule],
  templateUrl: './support-chat.component.html',
  styleUrls: ['./support-chat.component.scss']
})
export class SupportChatComponent implements OnInit {
  openConversations: Conversation[] = [];
  closedConversations: Conversation[] = [];
  private userId: string | null = null;

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private wsService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserIdFromToken();
    if (!this.userId) {
      console.error('Utilisateur non authentifié ou token invalide');
      return;
    }

    // 1️⃣ Charger l'historique des messages via HTTP
    this.chatService.getSupportMessages().subscribe({
      next: (msgs: any[]) => {
        // 1️⃣ Grouper par conversationId
        const convoMap: { [key: string]: Conversation } = {};

        msgs.forEach(msg => {
          if (!convoMap[msg.conversationId]) {
            convoMap[msg.conversationId] = {
              id: msg.conversationId,
              user: msg.fullName || 'Inconnu',
              createdAt: msg.timestamp ? new Date(msg.timestamp) : new Date(),
              messages: [],
              expanded: false
            };
          }
          convoMap[msg.conversationId].messages.push(msg);
        });

        this.openConversations = Object.values(convoMap);

        // 2️⃣ Connexion WebSocket après avoir chargé les conversations
        this.wsService.connect();

        // S'abonner à chaque conversation existante
        this.openConversations.forEach(c => this.wsService.subscribeToConversation(c.id));
      },
      error: err => console.error('Erreur récupération messages', err)
    });

    // 3️⃣ Écoute des messages entrants via WebSocket
    this.wsService.messages$.subscribe((msg: Messages_support) => {
      if (!msg || !msg.conversationId) return;

      let convo = this.openConversations.find(c => c.id === msg.conversationId)
        || this.closedConversations.find(c => c.id === msg.conversationId);

      if (!convo) {
        convo = {
          id: msg.conversationId,
          user: msg.fullName || 'Inconnu',
          createdAt: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          messages: [],
          expanded: false
        };
        this.openConversations.push(convo);
        this.wsService.subscribeToConversation(msg.conversationId);
      }

      convo.messages.push(msg);
    });
  }

  sendMessage(convo: Conversation) {
    const text = (convo.newMessage || '').trim();
    if (!text || !this.userId) return;

    // Envoi via WebSocket
    this.wsService.sendMessage(convo.id, text, this.userId);

    // Mise à jour locale immédiate
    convo.messages.push({
      senderId: this.userId,
      username: '',
      fullName: '',
      conversationId: convo.id,
      content: text,
      timestamp: new Date()
    });

    convo.newMessage = '';
  }

  resolveConversation(convo: Conversation) {
    this.openConversations = this.openConversations.filter(c => c.id !== convo.id);
    this.closedConversations.push(convo);
  }
}
