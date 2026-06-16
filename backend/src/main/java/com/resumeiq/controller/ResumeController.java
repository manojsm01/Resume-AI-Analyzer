package com.resumeiq.controller;

import com.resumeiq.model.ResumeAnalysis;
import com.resumeiq.model.SectionAnalysis;
import com.resumeiq.model.User;
import com.resumeiq.repository.ResumeAnalysisRepository;
import com.resumeiq.repository.UserRepository;
import com.resumeiq.service.AiAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final AiAnalysisService aiAnalysisService;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final UserRepository userRepository;

    public ResumeController(AiAnalysisService aiAnalysisService, ResumeAnalysisRepository resumeAnalysisRepository, UserRepository userRepository) {
        this.aiAnalysisService = aiAnalysisService;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeResume(@RequestParam("file") MultipartFile file) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

            String text = aiAnalysisService.extractText(file);
            AiAnalysisService.AiAnalysisResultDetailed result = aiAnalysisService.analyzeResumeDetailed(text);

            SectionAnalysis sectionAnalysis = new SectionAnalysis();
            if (result.sectionAnalysis != null) {
                sectionAnalysis.setContactInfo(result.sectionAnalysis.contactInfo);
                sectionAnalysis.setEducation(result.sectionAnalysis.education);
                sectionAnalysis.setSkillsSection(result.sectionAnalysis.skills);
                sectionAnalysis.setProjects(result.sectionAnalysis.projects);
                sectionAnalysis.setExperience(result.sectionAnalysis.experience);
                sectionAnalysis.setCertifications(result.sectionAnalysis.certifications);
            }

            ResumeAnalysis analysis = new ResumeAnalysis(
                user, 
                file.getOriginalFilename(), 
                result.atsScore, 
                result.resumeIq,
                result.summary, 
                result.strengths, 
                result.improvements,
                result.skills,
                result.missingSkills,
                result.recommendedRoles,
                result.interviewQuestions != null ? result.interviewQuestions.technical : new ArrayList<>(),
                result.interviewQuestions != null ? result.interviewQuestions.hr : new ArrayList<>(),
                result.interviewQuestions != null ? result.interviewQuestions.project : new ArrayList<>(),
                sectionAnalysis
            );
            analysis.setRawText(text);
            
            ResumeAnalysis savedAnalysis = resumeAnalysisRepository.save(analysis);

            return ResponseEntity.ok(savedAnalysis);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing file: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getHistory() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

            List<ResumeAnalysis> history = resumeAnalysisRepository.findByUserOrderByCreatedAtDesc(user);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving history: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getResumeById(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

            ResumeAnalysis analysis = resumeAnalysisRepository.findById(id).orElseThrow(() -> new RuntimeException("Analysis not found"));
            
            // Security check: ensure the analysis belongs to the logged-in user
            if (!analysis.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body("Access denied");
            }

            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving analysis: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/optimize")
    public ResponseEntity<?> optimizeResume(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

            ResumeAnalysis analysis = resumeAnalysisRepository.findById(id).orElseThrow(() -> new RuntimeException("Analysis not found"));
            
            if (!analysis.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body("Access denied");
            }

            if (analysis.getOptimizedResume() != null) {
                return ResponseEntity.ok(java.util.Collections.singletonMap("optimizedResume", analysis.getOptimizedResume()));
            }

            if (analysis.getRawText() == null) {
                return ResponseEntity.badRequest().body("Raw text is not available for this resume.");
            }

            String optimized = aiAnalysisService.optimizeResume(analysis.getRawText());
            analysis.setOptimizedResume(optimized);
            resumeAnalysisRepository.save(analysis);

            return ResponseEntity.ok(java.util.Collections.singletonMap("optimizedResume", optimized));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error optimizing resume: " + e.getMessage());
        }
    }
}
