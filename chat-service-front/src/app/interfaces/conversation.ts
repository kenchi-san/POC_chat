import {Message} from './message';

export interface Conversation {
  id: string;
  user: string;
  expanded?: boolean;
  createdAt: Date;
  messages: Message[];
  newMessage?: string;

}
