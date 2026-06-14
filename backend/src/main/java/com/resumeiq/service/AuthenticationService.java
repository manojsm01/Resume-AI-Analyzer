package com.resumeiq.service;

import com.resumeiq.dto.AuthenticationRequest;
import com.resumeiq.dto.AuthenticationResponse;
import com.resumeiq.dto.RegisterRequest;
import com.resumeiq.model.User;
import com.resumeiq.repository.UserRepository;
import com.resumeiq.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AuthenticationService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthenticationService(UserRepository repository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager, EmailService emailService) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
    }

    public AuthenticationResponse register(RegisterRequest request) {
        var user = new User(
            request.email(),
            passwordEncoder.encode(request.password()),
            request.firstName(),
            request.lastName(),
            User.Role.USER
        );
        user.setLastLogin(LocalDateTime.now());
        repository.save(user);
        
        // Trigger Email Notifications
        emailService.sendUserWelcomeEmail(user.getEmail(), user.getFirstName());
        emailService.sendAdminNotification(
            "New User Registration",
            "A new user has registered: " + user.getFirstName() + " " + user.getLastName() + " (" + user.getEmail() + ")"
        );
        
        var jwtToken = jwtService.generateToken(user);
        return new AuthenticationResponse(jwtToken, user.getRole().name());
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.email(),
                request.password()
            )
        );
        var user = repository.findByEmail(request.email())
            .orElseThrow();
        user.setLastLogin(LocalDateTime.now());
        repository.save(user);
        
        // Trigger Email Notifications
        emailService.sendUserLoginAlert(user.getEmail());
        
        var jwtToken = jwtService.generateToken(user);
        return new AuthenticationResponse(jwtToken, user.getRole().name());
    }
}
