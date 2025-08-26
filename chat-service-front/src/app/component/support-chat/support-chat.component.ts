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
      return;
    }

    // Appel backend pour charger les messages
    this.chatService.getSupportMessages().subscribe({
      next: (msgs: any[]) => {
        // 1️⃣ Grouper par conversationId
        const convoMap: { [key: string]: Conversation } = {};

        msgs.forEach(msg => {
          if (!convoMap[msg.conversationId]) {
            convoMap[msg.conversationId] = {
              id: msg.conversationId,
              user: msg.username, // tu peux remplacer par user.email si backend l’envoie
              createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
              messages: [],
              expanded: false
            };
          }

          convoMap[msg.conversationId].messages.push({
            senderId: msg.senderId,
            username: msg.username,
            conversationId: msg.conversationId,
            content: msg.content,
            timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date()
          });
        });

        // 2️⃣ Séparer les conversations ouvertes / fermées (si backend envoie un statut)
        this.openConversations = Object.values(convoMap).filter(c => true );
        this.closedConversations = Object.values(convoMap).filter(c => false );
      },
      error: err => console.error('Erreur récupération messages', err)
    });
  }
  sendMessage(convo: Conversation) {
    const text = (convo.newMessage || '').trim();
    if (!text) return;

    if (!this.userId) {
      console.error('Utilisateur non authentifié ou token invalide');
      return;
    }

    this.chatService.sendMessage(convo.id, this.userId, text).subscribe({
      next: (resp: any) => {
        const uiMsg: Message = {
          senderId: resp.senderId,
          username: resp.username,
          conversationId: resp.conversationId,
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
    // Déplacer la conversation des ouvertes vers les fermées
    this.openConversations = this.openConversations.filter(c => c.id !== convo.id);
    this.closedConversations.push(convo);

    // Tu peux éventuellement appeler ton backend pour marquer la conversation comme résolue
    // this.chatService.markConversationResolved(convo.id).subscribe();
  }

}
