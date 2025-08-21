package com.yourcaryourway.chat.chat_service.dtos.user;


import lombok.Data;

@Data
public class MeDto {
    private String email;

    private String userName;
    private String password;
}
