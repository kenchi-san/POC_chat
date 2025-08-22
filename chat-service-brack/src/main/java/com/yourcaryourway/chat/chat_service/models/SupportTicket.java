package com.yourcaryourway.chat.chat_service.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Entity
@NoArgsConstructor
@Data
@AllArgsConstructor
@Table(name = "support_ticket")
public class SupportTicket {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, length = 255)
    private String subject;

    @Column(nullable = false, length = 20)
    private String status = "OPEN";

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL)
    private List<Conversation> conversations;
}
