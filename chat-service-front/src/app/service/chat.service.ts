import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message } from '../interfaces/message';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/api/messages`;

  constructor(private http: HttpClient) {}

  getMessagesForUser(): Observable<Message[]> {
    const token = localStorage.getItem('auth_token'); // récupère ton JWT stocké après login
console.log('mon token'+token);
    return this.http.get<Message[]>(`${this.apiUrl}`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    });
  }



  // 🔹 POST : Envoyer un message
  sendMessage(conversationId: string, senderId: string, content: string): Observable<Message> {
    return this.http.post<Message>(
      this.apiUrl,
      { conversationId, senderId, content },
      { withCredentials: true }
    );
  }
}
