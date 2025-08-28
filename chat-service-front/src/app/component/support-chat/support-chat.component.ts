import {Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

import { Conversation } from '../../interfaces/conversation';
import { Message } from '../../interfaces/message';
import { AuthService } from '../../service/AuthService';
import { ChatService } from '../../service/chat.service';
import { WebSocketService } from '../../service/websocket.service';
import {Messages_support} from '../../interfaces/messages_support';

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
  userEmail: string | null = null;
  newMessage = '';
  conversationId: string | null = null;
  userId: string | null = null;
  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private wsService: WebSocketService
  ) {}
  @ViewChildren('scrollContainer') private scrollContainers!: QueryList<ElementRef>;

  ngOnInit(): void {
    const decoded = this.authService.getDecodedToken();
    this.userId = decoded?.userId || null; // <-- UUID du support
    this.userEmail = decoded?.email || decoded?.sub || null;

    if (!this.userId) {
      console.error('Support non authentifié (token sans userId)');
      return;
    }

    this.chatService.getSupportMessages().subscribe({
      next: (msgs: Messages_support[]) => {
        console.log('Messages reçus:', msgs); // 🔹 pour debugger
        const convoMap: { [key: string]: Conversation } = {};

        msgs.forEach(msg => {
          if (!convoMap[msg.conversationId]) {
            convoMap[msg.conversationId] = {
              id: msg.conversationId,
              user: msg.username || 'Support',
              createdAt: new Date(msg.createdAt),
              messages: [],
              expanded: false
            };
          }
          convoMap[msg.conversationId].messages.push(msg);
        });

        this.openConversations = Object.values(convoMap);
        this.wsService.connect();

        this.openConversations.forEach(c => this.wsService.subscribeToConversation(c.id));
      },
      error: err => console.error('Erreur récupération messages support', err)
    });

    this.wsService.messages$.subscribe((msg: Messages_support) => {
      if (!msg || !msg.conversationId) return;

      let convo =
        this.openConversations.find(c => c.id === msg.conversationId) ||
        this.closedConversations.find(c => c.id === msg.conversationId);

      if (!convo) {
        convo = {
          id: msg.conversationId,
          user: msg.username || 'Inconnu',
          createdAt: new Date(msg.createdAt),
          messages: [],
          expanded: false
        };
        this.openConversations.push(convo);
        this.wsService.subscribeToConversation(msg.conversationId);
      }

      convo.messages.push(msg);
      this.scrollToBottom(msg.conversationId);
    });
  }


  sendMessage(convo: Conversation): void {
    if (!convo.newMessage?.trim()) return;

    const decoded = this.authService.getDecodedToken();
    const email = decoded?.email || decoded?.sub || 'inconnu';

    this.wsService.sendSupportMessage(convo.id, convo.newMessage, email);

    convo.newMessage = '';
  }
  resolveConversation(convo: Conversation): void {
    this.openConversations = this.openConversations.filter(c => c.id !== convo.id);
    this.closedConversations.push(convo);
  }
  private scrollToBottom(convoId: string): void {
    setTimeout(() => {
      const containerEl = this.scrollContainers.find((el, index) => {
        const convo = this.openConversations[index];
        return convo.id === convoId;
      });

      if (containerEl) {
        containerEl.nativeElement.scrollTop = containerEl.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
