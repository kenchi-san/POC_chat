package com.yourcaryourway.chat.chat_service.controllers;


import com.yourcaryourway.chat.chat_service.dtos.user.LoginUserDto;
import com.yourcaryourway.chat.chat_service.dtos.user.RegisterUserDto;
import com.yourcaryourway.chat.chat_service.models.User;
import com.yourcaryourway.chat.chat_service.responses.LoginResponse;
import com.yourcaryourway.chat.chat_service.services.AuthenticationService;
import com.yourcaryourway.chat.chat_service.services.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RequestMapping("/auth")
//@CrossOrigin(origins = "http://localhost:4200")  // Autoriser l'accès depuis Angular
@RestController
public class AuthenticationController {
    private final JwtService jwtService;
    private final AuthenticationService authenticationService;

    public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }


    @PostMapping("/signup")
    public ResponseEntity<User> register(
            @RequestBody RegisterUserDto registerUserDto) {
        User registeredUser = authenticationService.signup(registerUserDto);
        return ResponseEntity.ok(registeredUser);
    }


    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticate(
            @RequestBody LoginUserDto loginUserDto) {

        User authenticatedUser = authenticationService.authenticate(loginUserDto);
        String jwtToken = jwtService.generateToken(authenticatedUser);
        LoginResponse loginResponse = new LoginResponse()
                .setToken(jwtToken);

        return ResponseEntity.ok(loginResponse);
    }
}
