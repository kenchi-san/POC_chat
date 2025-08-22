package com.yourcaryourway.chat.chat_service.repository;

import com.yourcaryourway.chat.chat_service.models.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, UUID> {
}
