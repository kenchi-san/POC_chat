package com.yourcaryourway.chat.chat_service.dtos.user;

import lombok.Data;
import lombok.experimental.Accessors;

@Accessors(chain = true)
@Data
public class LoginUserDto {
    private String email;

    private String password;
}