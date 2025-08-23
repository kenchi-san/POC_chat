package com.yourcaryourway.chat.chat_service.repository;

import com.yourcaryourway.chat.chat_service.models.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {}
