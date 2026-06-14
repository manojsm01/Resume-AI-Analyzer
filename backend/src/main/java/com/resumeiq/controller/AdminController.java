package com.resumeiq.controller;

import com.resumeiq.dto.AdminUserStatsDto;
import com.resumeiq.repository.UserRepository;
import com.resumeiq.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'MASTER_ADMIN')")
    public ResponseEntity<List<AdminUserStatsDto>> getAllUserStats() {
        return ResponseEntity.ok(userRepository.findAllUserStats());
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MASTER_ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
        
        if (currentUser != null && currentUser.getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "You cannot delete yourself"));
        }
        
        return userRepository.findById(id).map(user -> {
            if (user.getRole() == User.Role.MASTER_ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Master Admin cannot be deleted"));
            }
            userRepository.delete(user);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasAnyRole('ADMIN', 'MASTER_ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
        
        if (currentUser != null && currentUser.getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "You cannot change your own role"));
        }
        
        String newRoleStr = body.get("role");
        if (newRoleStr == null || (!newRoleStr.equals("ADMIN") && !newRoleStr.equals("USER") && !newRoleStr.equals("MASTER_ADMIN"))) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role"));
        }

        return userRepository.findById(id).map(user -> {
            if (user.getRole() == User.Role.MASTER_ADMIN && !newRoleStr.equals("MASTER_ADMIN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Master Admin role cannot be demoted"));
            }
            
            // Only a MASTER_ADMIN can promote someone to MASTER_ADMIN
            if (newRoleStr.equals("MASTER_ADMIN") && (currentUser == null || currentUser.getRole() != User.Role.MASTER_ADMIN)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Only a Master Admin can create another Master Admin"));
            }

            user.setRole(User.Role.valueOf(newRoleStr));
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Role updated successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
