package com.yourcaryourway.chat.chat_service.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

// Assure-toi que ces imports correspondent à tes propres modèles


@Entity
@NoArgsConstructor
@Data
@AllArgsConstructor
@Table(name = "messages")
public class ChatMessage {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
