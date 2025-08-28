package com.yourcaryourway.chat.chat_service.controllers;

import com.yourcaryourway.chat.chat_service.dtos.user.MessageRequestDto;
import com.yourcaryourway.chat.chat_service.dtos.user.MessageResponseDto;
import com.yourcaryourway.chat.chat_service.dtos.user.MessageResponseSupportDto;
import com.yourcaryourway.chat.chat_service.services.MessageService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {

    private final MessageService messageService;

    public ChatWebSocketController(MessageService messageService) {
        this.messageService = messageService;
    }

    // Réception des messages clients et broadcast
    @MessageMapping("/chat/send")
    @SendTo("/topic/messages")
    public MessageResponseDto handleMessage(MessageRequestDto request) {
        return messageService.createAndBroadcast(request);
    }

    @MessageMapping("/chat/support")
    @SendTo("/topic/support")
    public MessageResponseSupportDto handleSupport(MessageRequestDto request) {
        return messageService.createAndBroadcastSupport(request);
    }
}
