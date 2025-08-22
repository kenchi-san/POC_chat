package com.yourcaryourway.chat.chat_service.responses;

import lombok.Data;
import lombok.experimental.Accessors;

@Accessors(chain = true)
@Data
public class LoginResponse {
    private String token;
    private long expiresIn;

}