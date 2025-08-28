package com.yourcaryourway.chat.chat_service.services;

import com.yourcaryourway.chat.chat_service.dtos.user.MessageRequestDto;
import com.yourcaryourway.chat.chat_service.dtos.user.MessageResponseDto;
import com.yourcaryourway.chat.chat_service.dtos.user.MessageResponseSupportDto;
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

    /**
     * Message d’un utilisateur "classique" (client)
     */
    public MessageResponseDto createAndBroadcast(MessageRequestDto req) {
        // 1️⃣ Vérifier la conversation
        Conversation conv = conversationRepo.findById(req.getConversationId())
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        // 2️⃣ Trouver l’expéditeur
        User sender = userRepo.findByEmail(req.getSenderEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + req.getSenderEmail()));

        // 3️⃣ Créer et sauvegarder le message
        ChatMessage message = new ChatMessage();
        message.setConversation(conv);
        message.setSender(sender);
        message.setContent(req.getContent());
        message = messageRepo.save(message);

        OffsetDateTime createdAt = message.getCreatedAt().atOffset(ZoneOffset.UTC);

        // 4️⃣ DTO de réponse
        MessageResponseDto dto = new MessageResponseDto(
                message.getId(),
                sender.getFullName(),
                conv.getId(),
                sender.getId(),
                message.getContent(),
                createdAt
        );

        // 5️⃣ Diffusion WebSocket
        broker.convertAndSend("/topic/conversations/" + conv.getId(), dto);

        // 6️⃣ Compteur Redis
        redis.opsForValue().increment("conv:" + conv.getId() + ":count");

        return dto;
    }

    /**
     * Message vu côté support
     */
    public MessageResponseSupportDto createAndBroadcastSupport(MessageRequestDto req) {
        User sender = userRepo.findByEmail(req.getSenderEmail())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé : " + req.getSenderEmail()));

        Conversation conv = conversationRepo.findById(req.getConversationId())
                .orElseThrow(() -> new IllegalArgumentException("Conversation non trouvée : " + req.getConversationId()));

        ChatMessage message = new ChatMessage();
        message.setConversation(conv);
        message.setSender(sender);
        message.setContent(req.getContent());
        message = messageRepo.save(message);

        OffsetDateTime createdAt = message.getCreatedAt().atOffset(ZoneOffset.UTC);

        MessageResponseSupportDto dto = new MessageResponseSupportDto(
                message.getId(),
                sender.getFullName(),
                conv.getId(),
                sender.getId(),
                message.getContent(),
                createdAt
        );

        // 👉 Ici tu peux soit envoyer sur la conversation, soit sur un canal global support
        broker.convertAndSend("/topic/conversations/" + conv.getId(), dto);
        broker.convertAndSend("/topic/support", dto); // facultatif si tu veux un flux support global

        // Redis (optionnel, si tu veux aussi compter les messages côté support)
        redis.opsForValue().increment("conv:" + conv.getId() + ":count");

        return dto;
    }

    @Transactional
    public List<MessageResponseDto> getActiveMessagesForUser(String username) {
        User user = userRepo.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé : " + username));
        UUID userId = user.getId();

        return messageRepo.findByConversationUserIdAndConversationStatusTrueOrderByCreatedAtAsc(userId)
                .stream()
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

    public List<MessageResponseSupportDto> getAllMessagesForSupport() {
        return messageRepo.findByConversationStatusTrueOrderByConversationIdAscCreatedAtAsc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    private MessageResponseSupportDto toDto(ChatMessage message) {
        return new MessageResponseSupportDto(
                message.getId(),
                message.getSender().getFullName(),
                message.getConversation().getId(),
                message.getSender().getId(),
                message.getContent(),
                message.getCreatedAt().atOffset(ZoneOffset.UTC)
        );
    }
}
