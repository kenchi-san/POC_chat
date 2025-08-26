import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message } from '../interfaces/message';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getMessagesForUser(): Observable<Message[]> {
    const token = localStorage.getItem('auth_token');
    return this.http.get<Message[]>(`${this.apiUrl}/messages`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    });
  }
  sendMessage(conversationId: string, userEmail: string, content: string): Observable<Message> {
    const token = localStorage.getItem('auth_token');
    return this.http.post<Message>(
      this.apiUrl,
      { conversationId, userEmail, content },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }
    );
  }

  getSupportMessages(): Observable<Message[]> {
    const token = localStorage.getItem('auth_token');
    return this.http.get<Message[]>(`${this.apiUrl}/support/message`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    });
  }
}
