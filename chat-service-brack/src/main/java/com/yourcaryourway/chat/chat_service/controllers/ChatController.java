package com.yourcaryourway.chat.chat_service.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class ChatController {
    @GetMapping("/test")
    public ResponseDTO index() {
        return new ResponseDTO("Tu es bien connecté ^^");
    }

    static class ResponseDTO {
        private String message;

        public ResponseDTO(String message) {
            this.message = message;
        }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

}
