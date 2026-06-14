package com.resumeiq.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

@Service
public class AiAnalysisService {
    
    private static final Logger log = LoggerFactory.getLogger(AiAnalysisService.class);
    
    private final Executor geminiTaskExecutor;

    public AiAnalysisService(@org.springframework.beans.factory.annotation.Qualifier("geminiTaskExecutor") Executor geminiTaskExecutor) {
        this.geminiTaskExecutor = geminiTaskExecutor;
    }

    public String extractText(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();
        if (filename != null && filename.toLowerCase().endsWith(".pdf")) {
            try (PDDocument document = org.apache.pdfbox.Loader.loadPDF(file.getBytes())) {
                PDFTextStripper pdfStripper = new PDFTextStripper();
                return pdfStripper.getText(document);
            }
        } else {
            return new String(file.getBytes());
        }
    }

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.model.primary}")
    private String primaryModel;

    @Value("${gemini.model.fallback}")
    private String fallbackModel;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private com.google.genai.Client geminiClient;
    private com.google.genai.types.GenerateContentConfig config;

    @PostConstruct
    public void init() {
        // Build the client once on startup to reuse HTTP connection pools
        this.geminiClient = com.google.genai.Client.builder()
            .apiKey(geminiApiKey)
            .build();
            
        this.config = com.google.genai.types.GenerateContentConfig.builder()
            .responseMimeType("application/json")
            .temperature(0.1f) // Deterministic, highly analytical output
            .build();
            
        log.info("Gemini AI Client initialized with models. Primary: {}, Fallback: {}", primaryModel, fallbackModel);
    }

    public static class InterviewQuestionsDTO {
        public List<String> technical;
        public List<String> hr;
        public List<String> project;
    }

    public static class SectionAnalysisDTO {
        public String contactInfo;
        public String education;
        public String skills;
        public String projects;
        public String experience;
        public String certifications;
    }

    public static class AiAnalysisResultDetailed {
        public int atsScore;
        public double resumeIq;
        public String summary;
        public List<String> skills;
        public List<String> strengths;
        public List<String> improvements;
        public List<String> missingSkills;
        public List<String> recommendedRoles;
        public InterviewQuestionsDTO interviewQuestions;
        public SectionAnalysisDTO sectionAnalysis;
    }

    public AiAnalysisResultDetailed analyzeResumeDetailed(String text) {
        String prompt = "You are the world's strictest and most analytical ATS system, senior technical recruiter, and career coach. Your job is to aggressively critique resumes.\n" +
            "Analyze the following resume and return ONLY valid JSON.\n\n" +
            "{\n" +
            "  \"atsScore\": 0,\n" +
            "  \"resumeIq\": 0.0,\n" +
            "  \"summary\": \"\",\n" +
            "  \"skills\": [],\n" +
            "  \"strengths\": [],\n" +
            "  \"improvements\": [],\n" +
            "  \"missingSkills\": [],\n" +
            "  \"recommendedRoles\": [],\n" +
            "  \"interviewQuestions\": {\n" +
            "    \"technical\": [],\n" +
            "    \"hr\": [],\n" +
            "    \"project\": []\n" +
            "  },\n" +
            "  \"sectionAnalysis\": {\n" +
            "    \"contactInfo\": \"\",\n" +
            "    \"education\": \"\",\n" +
            "    \"skills\": \"\",\n" +
            "    \"projects\": \"\",\n" +
            "    \"experience\": \"\",\n" +
            "    \"certifications\": \"\"\n" +
            "  }\n" +
            "}\n\n" +
            "STRICT GRADING RUBRIC:\n" +
            "- If the resume lacks clear quantitative impact metrics (e.g. 'increased sales by 20%', 'saved 50 hours/week'), the maximum ATS Score is 65.\n" +
            "- If the resume uses vague language, cliché buzzwords without proof, or has poor structural formatting, heavily penalize the ATS Score and Resume IQ.\n" +
            "- A score of 80+ is reserved ONLY for truly exceptional, metric-driven, perfectly formatted resumes. Most resumes should score between 40 and 70.\n\n" +
            "Instructions:\n" +
            "1. Give a harsh but accurate ATS score out of 100 based on the rubric.\n" +
            "2. Give a corresponding Resume IQ score between 0.0 and 10.0.\n" +
            "3. Extract all explicit technical skills.\n" +
            "4. List 5 specific strengths found in the text.\n" +
            "5. List 5 highly critical improvements needed (cite missing impact metrics if applicable).\n" +
            "6. Identify missing industry-standard skills for the inferred job role.\n" +
            "7. Suggest 5 suitable job roles.\n" +
            "8. Generate: 5 hard technical questions, 3 HR questions, 2 project questions.\n" +
            "9. Analyze the quality of each section critically.\n" +
            "10. Write a professional, no-nonsense summary of the candidate's actual level.\n" +
            "11. Return ONLY valid JSON. Do not include markdown blocks.\n\n" +
            "Resume Text:\n" + text;

        long startTime = System.currentTimeMillis();
        int maxRetries = 3;
        long totalExecutionCapMs = 90000;
        int requestTimeoutMs = 45000;

        log.info("Starting resume analysis request. Text length: {} chars", text.length());

        if (geminiTaskExecutor instanceof ThreadPoolTaskExecutor pool) {
            log.info("Gemini Task Executor Stats - Active Threads: {}, Queue Size: {}, Pool Size: {}",
                pool.getActiveCount(), pool.getThreadPoolExecutor().getQueue().size(), pool.getPoolSize());
        }

        // Failure Simulation Trigger
        if (text.contains("SIMULATE_GEMINI_FAILURE")) {
            log.warn("Failure simulation triggered! Forcing local fallback.");
            return generateLocalFallback(text);
        }

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                if (System.currentTimeMillis() - startTime > totalExecutionCapMs) {
                    throw new TimeoutException("Total execution time cap exceeded.");
                }

                String modelToUse = (attempt < maxRetries) ? primaryModel : fallbackModel;
                log.info("Attempt {}/{} - Sending request using model: {}", attempt, maxRetries, modelToUse);

                CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
                    try {
                        com.google.genai.types.GenerateContentResponse response = geminiClient.models.generateContent(
                            modelToUse, prompt, config
                        );
                        return response.text();
                    } catch (Exception ex) {
                        throw new RuntimeException(ex);
                    }
                }, geminiTaskExecutor);

                String jsonText = future.get(requestTimeoutMs, TimeUnit.MILLISECONDS);
                
                if (jsonText != null) {
                    jsonText = jsonText.trim();
                    if (jsonText.startsWith("```json")) jsonText = jsonText.substring(7);
                    if (jsonText.startsWith("```")) jsonText = jsonText.substring(3);
                    if (jsonText.endsWith("```")) jsonText = jsonText.substring(0, jsonText.length() - 3);
                    
                    log.info("Gemini analysis successful on attempt {}. Duration: {}ms", attempt, (System.currentTimeMillis() - startTime));
                    return objectMapper.readValue(jsonText.trim(), AiAnalysisResultDetailed.class);
                }
                
                throw new RuntimeException("Empty response from Gemini SDK");

            } catch (Exception e) {
                Throwable cause = e.getCause() != null ? e.getCause() : e;
                String errorMsg = cause.getMessage() != null ? cause.getMessage() : e.toString();
                
                // Only retry on transient/capacity errors
                boolean shouldRetry = errorMsg.contains("503") || errorMsg.contains("429") || errorMsg.contains("500") || e instanceof TimeoutException;
                
                if (!shouldRetry || attempt == maxRetries || System.currentTimeMillis() - startTime > totalExecutionCapMs) {
                    log.error("Gemini API definitively failed on attempt {}. Error: {}. Falling back to local ATS engine.", attempt, errorMsg);
                    return generateLocalFallback(text);
                }

                // Exponential backoff
                try {
                    long backoffTime = (long) Math.pow(2, attempt) * 1000;
                    log.warn("Gemini API transient failure ({}). Retrying in {}ms (Attempt {})...", errorMsg, backoffTime, attempt + 1);
                    Thread.sleep(backoffTime);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return generateLocalFallback(text);
                }
            }
        }
        
        return generateLocalFallback(text);
    }

    private AiAnalysisResultDetailed generateLocalFallback(String text) {
        AiAnalysisResultDetailed fallback = new AiAnalysisResultDetailed();
        
        String lowerText = text.toLowerCase();
        
        // 1. Keyword density & Skill Extraction
        String[] commonSkills = {"java", "python", "react", "spring", "aws", "sql", "javascript", "typescript", "docker", "kubernetes", "ci/cd", "agile", "html", "css", "git", "node", "c++", "c#", "go", "ruby"};
        List<String> foundSkills = new ArrayList<>();
        int skillScore = 0;
        for (String skill : commonSkills) {
            if (lowerText.contains(skill)) {
                foundSkills.add(skill);
                skillScore += 5;
            }
        }
        
        // 2. Metrics & Experience Detection
        int metricScore = 0;
        if (lowerText.matches(".*\\d+%.*")) metricScore += 10;
        if (lowerText.contains("$")) metricScore += 10;
        if (lowerText.contains("increased") || lowerText.contains("reduced") || lowerText.contains("achieved") || lowerText.contains("managed")) metricScore += 15;
        if (lowerText.contains("years of experience") || lowerText.contains("proven experience")) metricScore += 10;
        
        // 3. Section Parsing
        int sectionScore = 0;
        boolean hasEducation = lowerText.contains("education") || lowerText.contains("university") || lowerText.contains("degree");
        boolean hasExperience = lowerText.contains("experience") || lowerText.contains("work history") || lowerText.contains("employment");
        boolean hasSkills = lowerText.contains("skills") || lowerText.contains("technologies");
        
        if (hasEducation) sectionScore += 10;
        if (hasExperience) sectionScore += 15;
        if (hasSkills) sectionScore += 10;
        
        // 4. Calculate total meaningful ATS Score
        int finalScore = Math.min(100, Math.max(30, skillScore + metricScore + sectionScore + 15)); // Base 15
        
        fallback.atsScore = Math.min(100, Math.max(0, finalScore));
        fallback.resumeIq = Math.round((fallback.atsScore / 10.0) * 10.0) / 10.0;
        
        fallback.summary = "AI analysis is temporarily offline due to high traffic. We have securely processed your resume locally, extracting your ATS score based on structural sections, industry metrics, and foundational skills.";
        fallback.skills = foundSkills;
        fallback.strengths = Arrays.asList(
            hasExperience ? "Experience section is clearly defined." : "Consider adding a clear Experience section.",
            hasEducation ? "Education background detected." : "Consider adding your Education background.",
            "Resume text was successfully parsed by local ATS fallback."
        );
        fallback.improvements = Arrays.asList(
            "Add more quantitative metrics (e.g., increased sales by 20%).",
            "Ensure standard section headers are used.",
            "Run AI analysis later for deeper structural feedback."
        );
        fallback.missingSkills = Arrays.asList("Communication", "Leadership");
        fallback.recommendedRoles = Arrays.asList("Software Engineer", "Systems Analyst");
        
        fallback.interviewQuestions = new InterviewQuestionsDTO();
        fallback.interviewQuestions.technical = Arrays.asList("Can you explain how you applied " + (foundSkills.isEmpty() ? "your core skills" : foundSkills.get(0)) + " in your previous roles?");
        fallback.interviewQuestions.hr = Arrays.asList("Describe a time you solved a difficult problem.", "Where do you see yourself in 5 years?");
        fallback.interviewQuestions.project = Arrays.asList("Walk me through your most complex project.", "How did you measure success in your last project?");
        
        fallback.sectionAnalysis = new SectionAnalysisDTO();
        fallback.sectionAnalysis.contactInfo = "Parsed locally. AI unavailable for deep contact info review.";
        fallback.sectionAnalysis.education = hasEducation ? "Education section detected." : "Missing clear Education section.";
        fallback.sectionAnalysis.skills = foundSkills.isEmpty() ? "No core skills detected." : "Skills detected successfully.";
        fallback.sectionAnalysis.projects = "Run AI analysis for project breakdown.";
        fallback.sectionAnalysis.experience = hasExperience ? "Experience section present." : "Missing work history.";
        fallback.sectionAnalysis.certifications = "Not deeply analyzed during offline fallback.";
        
        return fallback;
    }

    public String chatWithAi(String message, String context) {
        String prompt = "You are an expert career coach and technical interviewer at ResumeIQ. " +
            "Answer the user's query thoughtfully and professionally. Keep it concise but actionable. Do not use markdown blocks like ```markdown, just use standard formatting.\n\n" +
            (context != null && !context.isEmpty() ? "User's Resume Context:\n" + context + "\n\n" : "") +
            "User Query:\n" + message;

        com.google.genai.types.GenerateContentConfig chatConfig = com.google.genai.types.GenerateContentConfig.builder()
            .responseMimeType("text/plain")
            .build();

        long startTime = System.currentTimeMillis();
        int maxRetries = 2;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                String modelToUse = (attempt == 1) ? primaryModel : fallbackModel;
                CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
                    try {
                        com.google.genai.types.GenerateContentResponse response = geminiClient.models.generateContent(
                            modelToUse, prompt, chatConfig
                        );
                        return response.text();
                    } catch (Exception ex) {
                        throw new RuntimeException(ex);
                    }
                }, geminiTaskExecutor);

                String text = future.get(30000, TimeUnit.MILLISECONDS);
                if (text != null) return text;
                
            } catch (Exception e) {
                log.error("Gemini chat API failed on attempt {}. Error: {}", attempt, e.getMessage());
                if (e.getMessage() != null && e.getMessage().contains("429")) {
                    return "It looks like the Gemini AI API has reached its quota limit (429). But don't worry, the chat UI works perfectly! (This is a simulated fallback response).";
                }
                try { Thread.sleep(1000); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
            }
        }
        return "Sorry, the AI chat service is currently unavailable. Please try again later.";
    }
}
