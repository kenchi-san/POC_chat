import {Observable, tap} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as jwt_decode from 'jwt-decode'; // import namespace
import { jwtDecode } from "jwt-decode";

const API_URL = 'http://localhost:8081';

interface JwtPayload {
  exp: number;

  [key: string]: any;
}

@Injectable({providedIn: 'root'})
export class AuthService {
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${API_URL}/auth/login`, {email, password}).pipe(
      tap((res: any) => {
        if (res?.token) {
          localStorage.setItem(this.tokenKey, res.token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    else return true
  }
  getUserIdFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const decoded: any = this.decodeToken(token);
    return decoded?.sub || decoded?.id || null;
  }


  getDecodedToken(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch (e) {
      console.error('Token invalide', e);
      return null;
    }
  }
}
