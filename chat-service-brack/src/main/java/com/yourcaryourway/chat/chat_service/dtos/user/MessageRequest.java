package com.yourcaryourway.chat.chat_service.dtos.user;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Setter
@Getter
public class MessageRequest {
    // Getters / Setters
    private UUID conversationId;
    private UUID senderId;
    private String content;

}
