package com.yourcaryourway.chat.chat_service.services;

import com.yourcaryourway.chat.chat_service.dtos.user.MessageRequestDto;
import com.yourcaryourway.chat.chat_service.dtos.user.MessageResponseDto;
import com.yourcaryourway.chat.chat_service.models.ChatMessage;
import com.yourcaryourway.chat.chat_service.models.Conversation;
import com.yourcaryourway.chat.chat_service.models.User;
import com.yourcaryourway.chat.chat_service.repository.ChatMessageRepository;
import com.yourcaryourway.chat.chat_service.repository.ConversationRepository;
import com.yourcaryourway.chat.chat_service.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class MessageService {

    private final ConversationRepository conversationRepo;
    private final ChatMessageRepository messageRepo;
    private final UserRepository userRepo;
    private final SimpMessagingTemplate broker;
    private final StringRedisTemplate redis;

    public MessageService(ConversationRepository conversationRepo,
                          ChatMessageRepository messageRepo,
                          UserRepository userRepo,
                          SimpMessagingTemplate broker,
                          StringRedisTemplate redis) {
        this.conversationRepo = conversationRepo;
        this.messageRepo = messageRepo;
        this.userRepo = userRepo;
        this.broker = broker;
        this.redis = redis;
    }

    @Transactional
    public MessageResponseDto createAndBroadcast(MessageRequestDto req) {
        Conversation conv = conversationRepo.findById(req.getConversationId())
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        User sender = userRepo.findById(req.getSenderId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ChatMessage message = new ChatMessage();
        message.setConversation(conv);
        message.setSender(sender);
        message.setContent(req.getContent());
        message = messageRepo.save(message);

        OffsetDateTime createdAt = message.getCreatedAt().atOffset(ZoneOffset.UTC);

        MessageResponseDto dto = new MessageResponseDto(
                message.getId(),
                conv.getId(),
                sender.getId(),
                message.getContent(),
                createdAt
        );

        // WebSocket
        broker.convertAndSend("/topic/conversations/" + conv.getId(), dto);

        // Redis counter
        redis.opsForValue().increment("conv:" + conv.getId() + ":count");

        return dto;
    }

    @Transactional
    public List<MessageResponseDto> getHistory(UUID conversationId, LocalDateTime after, int limit) {
        Conversation conv = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        List<ChatMessage> messages;
        if (after != null) {
            messages = messageRepo.findByConversationAndCreatedAtAfterOrderByCreatedAtAsc(conv, after);
        } else {
            messages = messageRepo.findTop50ByConversationOrderByCreatedAtAsc(conv);
        }

        if (messages.size() > limit) {
            messages = messages.subList(0, limit);
        }

        return messages.stream()
                .map(m -> new MessageResponseDto(
                        m.getId(),
                        conv.getId(),
                        m.getSender().getId(),
                        m.getContent(),
                        m.getCreatedAt().atOffset(ZoneOffset.UTC)
                ))
                .toList();
    }
}
