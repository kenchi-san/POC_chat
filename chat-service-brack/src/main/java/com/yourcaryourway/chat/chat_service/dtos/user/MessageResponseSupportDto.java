package com.yourcaryourway.chat.chat_service.dtos.user;

import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Getter;

@Getter
public class MessageResponseSupportDto {
    // Getters
    private final UUID id;
    private final String username;
    private final UUID conversationId;
    private final UUID senderId;
    private final String content;
    private final OffsetDateTime createdAt;

    public MessageResponseSupportDto(UUID id, String username, UUID conversationId, UUID senderId, String content, OffsetDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.content = content;
        this.createdAt = createdAt;
    }
}
