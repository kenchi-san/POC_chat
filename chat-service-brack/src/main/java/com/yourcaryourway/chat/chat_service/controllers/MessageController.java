package com.yourcaryourway.chat.chat_service.controllers;

import com.yourcaryourway.chat.chat_service.dtos.user.MessageRequest;
import com.yourcaryourway.chat.chat_service.dtos.user.MessageResponse;
import com.yourcaryourway.chat.chat_service.services.MessageService;
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
    public ResponseEntity<MessageResponse> post(@RequestBody MessageRequest req) {
        return ResponseEntity.ok(messageService.createAndBroadcast(req));
    }

    @GetMapping("/messages")
    public ResponseEntity<List<MessageResponse>> history(
            @RequestParam UUID conversationId,
            @RequestParam(required = false) String after,
            @RequestParam(defaultValue = "50") int limit) {

        LocalDateTime afterDate = after != null ? LocalDateTime.parse(after) : null;
        List<MessageResponse> messages = messageService.getHistory(conversationId, afterDate, limit);
        return ResponseEntity.ok(messages);
    }
}
