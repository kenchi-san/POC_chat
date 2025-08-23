package com.yourcaryourway.chat.chat_service.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "support_ticket")
public class SupportTicket {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, length = 100)
    private String subject;

    @Column(nullable = false, length = 20)
    private String status = "OPEN";
}
