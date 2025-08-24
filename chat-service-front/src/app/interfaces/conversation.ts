import { Message } from './message';

export interface Conversation {
  id: string;
  user: string;
  expanded?: boolean;
  messages: Message[];
}
