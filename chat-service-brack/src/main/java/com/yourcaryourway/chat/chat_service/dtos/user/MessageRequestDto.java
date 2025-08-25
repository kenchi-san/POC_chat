package com.yourcaryourway.chat.chat_service.dtos.user;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.UUID;

@Setter
@Getter
public class MessageRequestDto {
    // Getters / Setters
    private UUID conversationId;
    private String senderEmail;
    private String content;
}
