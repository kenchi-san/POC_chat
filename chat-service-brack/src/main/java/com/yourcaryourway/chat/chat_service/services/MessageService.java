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
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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

    public MessageResponseDto createAndBroadcast(MessageRequestDto req) {
        Conversation conv = conversationRepo.findById(req.getConversationId())
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        System.out.println("info_utilisateur:"+conv.getUser().getFullName());
//        User sender = userRepo.findByEmail(req.getSenderEmail())
//                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ChatMessage message = new ChatMessage();
        message.setConversation(conv);
        message.setSender(conv.getUser());
        message.setContent(req.getContent());
        message = messageRepo.save(message);

        OffsetDateTime createdAt = message.getCreatedAt().atOffset(ZoneOffset.UTC);

        MessageResponseDto dto = new MessageResponseDto(
                message.getId(),
                conv.getUser().getFullName(),
                conv.getId(),
                conv.getUser().getId(),
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
    public List<MessageResponseDto> getActiveMessagesForUser(String username) {
        User user = userRepo.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé : " + username));
        UUID userId = user.getId();
        List<ChatMessage> messages = messageRepo.findByConversationUserIdAndConversationStatusTrueOrderByCreatedAtAsc(userId);
        return messages.stream()
                .map(m -> new MessageResponseDto(
                        m.getId(),
                        m.getSender().getFullName(),
                        m.getConversation().getId(),
                        m.getSender().getId(),
                        m.getContent(),
                        m.getCreatedAt().atOffset(ZoneOffset.UTC)
                ))
                .collect(Collectors.toList());
    }

}
