package com.yourcaryourway.chat.chat_service.controllers;

import com.yourcaryourway.chat.chat_service.dtos.user.MessageRequestDto;
import com.yourcaryourway.chat.chat_service.dtos.user.MessageResponseDto;
import com.yourcaryourway.chat.chat_service.services.MessageService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping("/messages")
    public ResponseEntity<MessageResponseDto> post(@RequestBody MessageRequestDto req) {
        return ResponseEntity.ok(messageService.createAndBroadcast(req));
    }

    @GetMapping("/messages")
    public ResponseEntity<List<MessageResponseDto>> history(@AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername();
        List<MessageResponseDto> messages = messageService.getActiveMessagesForUser(username);
        return ResponseEntity.ok(messages);
    }
}
