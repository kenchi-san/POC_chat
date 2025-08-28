import {Message} from '../interfaces/message';
import {Client, IMessage} from '@stomp/stompjs';
import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import SockJS from 'sockjs-client';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private client!: Client;
  private messagesSubject = new Subject<Message>();
  messages$ = this.messagesSubject.asObservable();

  connect() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8081/ws'),
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
    });

    this.client.onConnect = () => {
      console.log('✅ WebSocket connecté');
    };

    this.client.activate();
  }

  subscribeToConversation(conversationId: string) {
    this.client.onConnect = () => {
      this.client.subscribe(`/topic/conversations/${conversationId}`, (msg: IMessage) => {
        const data: Message = JSON.parse(msg.body);
        this.messagesSubject.next(data);
      });
    };
  }

  subscribeToSupport() {
    this.client.onConnect = () => {
      this.client.subscribe('/topic/support', (msg: IMessage) => {
        const data: Message = JSON.parse(msg.body);
        this.messagesSubject.next(data);
      });
    };
  }

  sendClientMessage(conversationId: string, content: string, senderEmail: string) {
    if (!this.client || !this.client.connected) return;
    const payload = { conversationId, content, senderEmail };
    this.client.publish({ destination: '/app/chat/send', body: JSON.stringify(payload) });
  }

  sendSupportMessage(conversationId: string, content: string, senderEmail: string) {
    if (!this.client || !this.client.connected) return;
    const payload = { conversationId, content, senderEmail };
    this.client.publish({ destination: '/app/chat/support', body: JSON.stringify(payload) });
  }
}
