package com.resumeiq.controller;

import com.resumeiq.dto.ChatRequest;
import com.resumeiq.dto.ChatResponse;
import com.resumeiq.service.AiAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final AiAnalysisService aiAnalysisService;

    public ChatController(AiAnalysisService aiAnalysisService) {
        this.aiAnalysisService = aiAnalysisService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        try {
            String aiResponse = aiAnalysisService.chatWithAi(request.getMessage(), request.getContext());
            return ResponseEntity.ok(new ChatResponse(aiResponse));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ChatResponse("Error processing request: " + e.getMessage()));
        }
    }
}
