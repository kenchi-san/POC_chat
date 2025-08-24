import { Routes } from '@angular/router';
import {LoginComponent} from './pages/login/login.component';
import {ChatServiceComponent} from './pages/chat-service/chat-service.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'chat-service', component: ChatServiceComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
