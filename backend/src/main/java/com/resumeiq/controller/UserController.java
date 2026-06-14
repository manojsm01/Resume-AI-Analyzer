package com.resumeiq.controller;

import com.resumeiq.dto.ChangePasswordRequest;
import com.resumeiq.dto.UserProfileDTO;
import com.resumeiq.model.User;
import com.resumeiq.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getProfile() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(new UserProfileDTO(user.getFirstName(), user.getLastName(), user.getEmail()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateProfile(@RequestBody UserProfileDTO request) {
        User user = getAuthenticatedUser();
        
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        // Deliberately ignoring email update to prevent unauthorized account hijacking
        
        userRepository.save(user);
        return ResponseEntity.ok(new UserProfileDTO(user.getFirstName(), user.getLastName(), user.getEmail()));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        User user = getAuthenticatedUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Incorrect current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok("Password updated successfully");
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }
}
