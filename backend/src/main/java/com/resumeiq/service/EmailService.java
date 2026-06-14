package com.resumeiq.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendUserLoginAlert(String userEmail) {
        // Disabled to reduce email spam, as requested by the user
    }

    @Async
    public void sendUserWelcomeEmail(String userEmail, String firstName) {
        try {
            jakarta.mail.internet.MimeMessage mimeMessage = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(mimeMessage, "utf-8");
            
            helper.setFrom(new jakarta.mail.internet.InternetAddress(fromEmail, "ResumeIQ"));
            helper.setTo(userEmail);
            helper.setSubject("Welcome to ResumeIQ, " + firstName + "!");
            
            String body = "Hi " + firstName + ",\n\n" +
                          "Thank you for joining ResumeIQ!\n" +
                          "We encourage you to log in and explore our advanced AI tools to improve your resume.\n\n" +
                          "Best regards,\n" +
                          "The ResumeIQ Team";
            
            helper.setText(body, false);
            mailSender.send(mimeMessage);
            log.info("Welcome email sent successfully to {}", userEmail);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", userEmail, e.getMessage());
        }
    }

    @Async
    public void sendAdminNotification(String subject, String body) {
        try {
            jakarta.mail.internet.MimeMessage mimeMessage = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(mimeMessage, "utf-8");
            
            helper.setFrom(new jakarta.mail.internet.InternetAddress(fromEmail, "ResumeIQ"));
            helper.setTo("admin@resumeiq.com"); 
            helper.setSubject("[ADMIN ALERT] " + subject);
            helper.setText(body, false);
            
            mailSender.send(mimeMessage);
            log.info("Admin notification sent successfully.");
        } catch (Exception e) {
            log.error("Failed to send admin notification: {}", e.getMessage());
        }
    }
}
