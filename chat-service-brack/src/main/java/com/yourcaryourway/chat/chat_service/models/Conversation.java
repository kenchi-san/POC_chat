package com.yourcaryourway.chat.chat_service.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@NoArgsConstructor
@Data
@AllArgsConstructor
@Table(name = "conversations")
public class Conversation {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    private SupportTicket ticket;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL)
    private List<ChatMessage> messages;
}
