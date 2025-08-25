package com.yourcaryourway.chat.chat_service.repository;

import com.yourcaryourway.chat.chat_service.models.ChatMessage;
import com.yourcaryourway.chat.chat_service.models.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findByConversationUserIdAndConversationStatusTrueOrderByCreatedAtAsc(UUID userId);
}
