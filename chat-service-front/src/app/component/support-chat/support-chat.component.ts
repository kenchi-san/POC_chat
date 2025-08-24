import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Conversation} from '../../interfaces/conversation';
import { MatExpansionModule } from '@angular/material/expansion'; // ✅ Import nécessaire

@Component({
  selector: 'app-support-chat',
  standalone: true,
  imports: [CommonModule, MatButtonModule, FormsModule, MatExpansionModule ],
  templateUrl: './support-chat.component.html',
  styleUrls: ['./support-chat.component.scss']
})
export class SupportChatComponent implements OnInit {
  openConversations: Conversation[] = [];
  closedConversations: Conversation[] = [];

  ngOnInit(): void {
    this.openConversations = [
      {
        id: '1',
        user: 'Alice',
        messages: [{ senderId: 'Alice', content: 'Bonjour', timestamp: new Date() }],
        expanded: false,
        newMessage: ''
      },
      {
        id: '2',
        user: 'Bob',
        messages: [{ senderId: 'Bob', content: 'Problème de connexion', timestamp: new Date() }],
        expanded: false,
        newMessage: ''
      }
    ];
  }

  toggleConversation(convo: Conversation) {
    convo.expanded = !convo.expanded;
  }

  sendMessage(convo: Conversation, newMessage: string) {
    if (!newMessage) return;
    convo.messages.push({ senderId: 'Support', content: newMessage, timestamp: new Date() });
  }

  resolveConversation(convo: Conversation) {
    this.openConversations = this.openConversations.filter(c => c.id !== convo.id);
    this.closedConversations.push(convo);
  }
}
