package com.yourcaryourway.chat.chat_service.dtos.user;

import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
public class MessageResponse {
    // Getters
    private final UUID id;
    private final UUID conversationId;
    private final UUID senderId;
    private final String content;
    private final OffsetDateTime createdAt;

    public MessageResponse(UUID id, UUID conversationId, UUID senderId, String content, OffsetDateTime createdAt) {
        this.id = id;
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.content = content;
        this.createdAt = createdAt;
    }

}
