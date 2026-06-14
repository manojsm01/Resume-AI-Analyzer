package com.resumeiq.repository;

import com.resumeiq.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import com.resumeiq.dto.AdminUserStatsDto;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    @Query("SELECT new com.resumeiq.dto.AdminUserStatsDto(u.id, u.firstName, u.lastName, u.email, u.role, u.createdAt, u.lastLogin, COUNT(r), AVG(r.score)) " +
           "FROM User u LEFT JOIN ResumeAnalysis r ON u.id = r.user.id " +
           "GROUP BY u.id, u.firstName, u.lastName, u.email, u.role, u.createdAt, u.lastLogin")
    List<AdminUserStatsDto> findAllUserStats();
}
