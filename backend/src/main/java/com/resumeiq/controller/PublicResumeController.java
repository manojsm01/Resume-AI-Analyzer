package com.resumeiq.controller;

import com.resumeiq.service.AiAnalysisService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicResumeController {

    @Autowired
    private AiAnalysisService aiAnalysisService;

    // Simple Rate Limiting: IP -> {count, windowStartTime}
    private final Map<String, RateLimitData> rateLimitMap = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS_PER_HOUR = 3;
    private static final long WINDOW_SIZE_MS = 3600 * 1000; // 1 hour

    static class RateLimitData {
        int count;
        long windowStartTime;

        RateLimitData(int count, long windowStartTime) {
            this.count = count;
            this.windowStartTime = windowStartTime;
        }
    }

    private boolean isRateLimited(String ipAddress) {
        long currentTime = Instant.now().toEpochMilli();
        rateLimitMap.putIfAbsent(ipAddress, new RateLimitData(0, currentTime));
        
        RateLimitData data = rateLimitMap.get(ipAddress);
        
        synchronized (data) {
            if (currentTime - data.windowStartTime > WINDOW_SIZE_MS) {
                // Reset window
                data.count = 0;
                data.windowStartTime = currentTime;
            }
            
            if (data.count >= MAX_REQUESTS_PER_HOUR) {
                return true;
            }
            data.count++;
            return false;
        }
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeResumePublic(@RequestParam("file") MultipartFile file, HttpServletRequest request) {
        try {
            String clientIp = request.getRemoteAddr();
            
            // X-Forwarded-For if behind a proxy
            String forwardedFor = request.getHeader("X-Forwarded-For");
            if (forwardedFor != null && !forwardedFor.isEmpty()) {
                clientIp = forwardedFor.split(",")[0];
            }

            if (isRateLimited(clientIp)) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body("Rate limit exceeded. Please try again later or create a free account.");
            }

            String text = aiAnalysisService.extractText(file);
            // Public endpoint uses the detailed analysis so guests can see Job Roles too.
            // But we do not save it to the DB!
            AiAnalysisService.AiAnalysisResultDetailed result = aiAnalysisService.analyzeResumeDetailed(text);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing file: " + e.getMessage());
        }
    }
}
