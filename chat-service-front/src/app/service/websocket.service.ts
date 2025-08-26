import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import { Messages_support } from '../interfaces/messages_support';
import SockJS from 'sockjs-client';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private client!: Client;
  private messagesSubject = new Subject<Messages_support>();
  messages$ = this.messagesSubject.asObservable();

  connect() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8081/ws'),
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
    });

    this.client.onConnect = () => {
      console.log('WebSocket connecté');
    };

    this.client.activate();
  }

  subscribeToConversation(conversationId: string) {
    if (!this.client || !this.client.connected) return;

    this.client.subscribe(`/topic/conversations/${conversationId}`, (msg: Message) => {
      const messageData: Messages_support = JSON.parse(msg.body);
      console.log('Message reçu via WS :', messageData); // 🔹 Important pour debug
      this.messagesSubject.next(messageData);
    });
  }

  sendMessage(conversationId: string, content: string, senderEmail: string) {
    if (!this.client || !this.client.connected) return;

    const payload = { conversationId, content, senderEmail };
    this.client.publish({ destination: '/app/chat.sendMessage', body: JSON.stringify(payload) });
  }
}
