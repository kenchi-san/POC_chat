import { Routes } from '@angular/router';
import {LoginComponent} from './pages/login/login.component';
import {ChatServiceComponent} from './pages/chat-service/chat-service.component';
import {AuthRedirectGuard} from './guard/AuthRedirectGuard';
import {AuthGuard} from './guard/AuthGuard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [AuthRedirectGuard] },
  { path: 'chat-service', component: ChatServiceComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
