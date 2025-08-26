import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';

import { Conversation } from '../../interfaces/conversation';
import { ChatService } from '../../service/chat.service';
import { AuthService } from '../../service/AuthService';
import { Messages_support } from '../../interfaces/messages_support';

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

    // Charger toutes les conversations et messages
    this.chatService.getSupportMessages().subscribe({
      next: (msgs: any[]) => {
        // 1️⃣ Grouper par conversationId
        const convoMap: { [key: string]: Conversation } = {};

        msgs.forEach(msg => {
          if (!convoMap[msg.conversationId]) {
            convoMap[msg.conversationId] = {
              id: msg.conversationId,
              user: msg.fullName, // affichage dans le titre
              createdAt: msg.timestamp ? new Date(msg.timestamp) : new Date(),
              messages: [],
              expanded: false
            };
          }

          // Ajouter le message dans la conversation
          convoMap[msg.conversationId].messages.push({
            senderId: msg.senderId,
            username: msg.username,
            fullName: msg.fullName,
            conversationId: msg.conversationId,
            content: msg.content,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          } as Messages_support);
        });

        // Séparer ouvert / fermé si statut existe
        this.openConversations = Object.values(convoMap).filter(c => true); // pour l'instant tout ouvert
        this.closedConversations = Object.values(convoMap).filter(c => false); // rien pour l'instant
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

    // 👇 Log des données envoyées
    console.log('Envoi au backend:', {
      conversationId: convo.id,
      userId: this.userId,
      content: text
    });

    this.chatService.sendMessageFromSupport(convo.id, this.userId, text).subscribe({
      next: (resp: any) => {
        const uiMsg: Messages_support = {
          senderId: resp.senderId,
          username: resp.username,
          fullName: resp.fullName,
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

    // Appel backend optionnel pour marquer comme résolue
    // this.chatService.markConversationResolved(convo.id).subscribe();
  }
}
