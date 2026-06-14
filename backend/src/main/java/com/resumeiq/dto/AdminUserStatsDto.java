package com.resumeiq.dto;

import com.resumeiq.model.User;
import java.time.LocalDateTime;

public class AdminUserStatsDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private User.Role role;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private Long totalResumesAnalyzed;
    private Double averageScore;

    public AdminUserStatsDto(Long id, String firstName, String lastName, String email, User.Role role, LocalDateTime createdAt, LocalDateTime lastLogin, Long totalResumesAnalyzed, Double averageScore) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.createdAt = createdAt;
        this.lastLogin = lastLogin;
        this.totalResumesAnalyzed = totalResumesAnalyzed;
        this.averageScore = averageScore;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public User.Role getRole() { return role; }
    public void setRole(User.Role role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }

    public Long getTotalResumesAnalyzed() { return totalResumesAnalyzed; }
    public void setTotalResumesAnalyzed(Long totalResumesAnalyzed) { this.totalResumesAnalyzed = totalResumesAnalyzed; }

    public Double getAverageScore() { return averageScore; }
    public void setAverageScore(Double averageScore) { this.averageScore = averageScore; }
}
