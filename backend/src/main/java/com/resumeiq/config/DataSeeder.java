package com.resumeiq.config;

import com.resumeiq.model.User;
import com.resumeiq.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    public CommandLineRunner initDefaultUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String defaultEmail = "admin@resumeiq.com";
            var existingUserOpt = userRepository.findByEmail(defaultEmail);
            
            if (existingUserOpt.isEmpty()) {
                log.info("Creating default unlimited access user...");
                User defaultUser = new User(
                    defaultEmail,
                    passwordEncoder.encode("admin123"),
                    "Super",
                    "Admin",
                    User.Role.MASTER_ADMIN
                );
                userRepository.save(defaultUser);
                log.info("Default user created! Email: {} | Password: {}", defaultEmail, "admin123");
            } else {
                User existingUser = existingUserOpt.get();
                if (existingUser.getRole() != User.Role.MASTER_ADMIN) {
                    log.info("Upgrading existing default user to MASTER_ADMIN...");
                    existingUser.setRole(User.Role.MASTER_ADMIN);
                    userRepository.save(existingUser);
                }
                log.info("Default user already exists and is MASTER_ADMIN. Email: {}", defaultEmail);
            }
        };
    }
}
