package com.yourcaryourway.chat.chat_service.controllers;

import com.yourcaryourway.chat.chat_service.dtos.user.LoginUserDto;
import com.yourcaryourway.chat.chat_service.dtos.user.RegisterUserDto;
import com.yourcaryourway.chat.chat_service.models.User;
import com.yourcaryourway.chat.chat_service.responses.LoginResponse;
import com.yourcaryourway.chat.chat_service.services.AuthenticationService;
import com.yourcaryourway.chat.chat_service.services.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RequestMapping("/auth")
//@CrossOrigin(origins = "http://localhost:4200")  // Autoriser l'accès depuis Angular si besoin
@RestController
public class AuthenticationController {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationController.class);

    private final JwtService jwtService;
    private final AuthenticationService authenticationService;

    public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticate(@RequestBody LoginUserDto loginUserDto) {
        User authenticatedUser = authenticationService.authenticate(loginUserDto);
        String jwtToken = jwtService.generateToken(authenticatedUser);
        LoginResponse loginResponse = new LoginResponse()
                .setToken(jwtToken);

        return ResponseEntity.ok(loginResponse);
    }
}
