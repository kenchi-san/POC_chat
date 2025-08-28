export interface Message {
  id: string;              // UUID
  username: string;        // nom complet de l’expéditeur
  conversationId: string;  // UUID conversation
  senderId: string;        // UUID user
  content: string;         // texte du message
  createdAt: string;       // ISO date/heure (OffsetDateTime)
}
