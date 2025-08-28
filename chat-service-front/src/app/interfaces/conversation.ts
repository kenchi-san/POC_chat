import {Messages_support} from './messages_support';

export interface Conversation {
  id: string;
  user: string;
  expanded?: boolean;
  createdAt: Date;
  messages: Messages_support[];
  newMessage?: string;

}
