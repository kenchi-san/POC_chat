package com.yourcaryourway.chat.chat_service.services;


import com.yourcaryourway.chat.chat_service.dtos.user.LoginUserDto;
import com.yourcaryourway.chat.chat_service.dtos.user.RegisterUserDto;
import com.yourcaryourway.chat.chat_service.models.User;
import com.yourcaryourway.chat.chat_service.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AuthenticationService {
    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    public AuthenticationService(
            UserRepository userRepository,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Déclarer la constante en dehors de la méthode, au niveau de la classe
    private static final String PASSWORD_REGEX =
            "^(?=.*[0-9])" +                    // au moins un chiffre
                    "(?=.*[a-z])" +                     // au moins une minuscule
                    "(?=.*[A-Z])" +                     // au moins une majuscule
                    "(?=.*[!@#$%^&*()_+=\\-{}\\[\\]:;\"'`~<>.,?/\\\\|])" + // au moins un caractère spécial
                    "(?=\\S+$).{12,}$";                  // pas d'espaces, min 12 caractères


    public User signup(RegisterUserDto input) {
        Pattern pattern = Pattern.compile("(?i)(<script|</script|\\bon\\w+=|alert\\(|<\\/?\\w+>|\\bSELECT\\b|\\bINSERT\\b|\\bDELETE\\b|\\bUPDATE\\b|\\bDROP\\b|\\bEXEC\\b)");
        Matcher matcher = pattern.matcher(input.getEmail());
        if (matcher.find()) {
            throw new IllegalArgumentException("Entrée interdite : tentative de code détectée.");
        }
        if (input.getPassword() == null || !input.getPassword().matches(PASSWORD_REGEX)) {
            throw new IllegalArgumentException("Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.");
        }

        User user = new User()
                .setUsername(input.getUserName().replaceAll("\\s+", "_"))
                .setEmail(input.getEmail())
                .setPassword(passwordEncoder.encode(input.getPassword()));

        return userRepository.save(user);
    }

    public User authenticate(LoginUserDto input) {
        String rawInput = input.getEmail().trim();
        String password = input.getPassword();

        // Vérifie si c'est un email
        boolean isEmail = rawInput.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");

        // Si ce n'est pas un email, on remplace les espaces par des "_"
        String searchKey = isEmail ? rawInput : rawInput.replaceAll("\\s+", "_");

        User user = isEmail
                ? userRepository.findByEmail(searchKey)
                .orElseThrow(() -> new IllegalArgumentException("Identifiant ou mot de passe incorrect"))
                : userRepository.findByUsername(searchKey)
                .orElseThrow(() -> new IllegalArgumentException("Identifiant ou mot de passe incorrect"));

        // Authentification (toujours par l’email, car c’est ce que Spring Security attend)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), password)
        );

        return user;
    }
}