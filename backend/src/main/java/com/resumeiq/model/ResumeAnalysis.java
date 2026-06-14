package com.resumeiq.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "resume_analyses")
public class ResumeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many analyses belong to one user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String filename;
    
    private int score;
    
    private double resumeIq;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @ElementCollection
    @CollectionTable(name = "resume_strengths", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "strength", columnDefinition = "TEXT")
    private List<String> strengths;

    @ElementCollection
    @CollectionTable(name = "resume_improvements", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "improvement", columnDefinition = "TEXT")
    private List<String> improvements;

    @ElementCollection
    @CollectionTable(name = "resume_extracted_skills", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "skill")
    private List<String> extractedSkills;

    @ElementCollection
    @CollectionTable(name = "resume_missing_skills", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "skill")
    private List<String> missingSkills;

    @ElementCollection
    @CollectionTable(name = "resume_recommended_roles", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "role", columnDefinition = "TEXT")
    private List<String> recommendedRoles;

    @ElementCollection
    @CollectionTable(name = "resume_tech_questions", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "question", columnDefinition = "TEXT")
    private List<String> techQuestions;

    @ElementCollection
    @CollectionTable(name = "resume_hr_questions", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "question", columnDefinition = "TEXT")
    private List<String> hrQuestions;

    @ElementCollection
    @CollectionTable(name = "resume_project_questions", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "question", columnDefinition = "TEXT")
    private List<String> projectQuestions;

    @Embedded
    private SectionAnalysis sectionAnalysis;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public ResumeAnalysis() {}

    public ResumeAnalysis(User user, String filename, int score, double resumeIq, String summary, 
                          List<String> strengths, List<String> improvements,
                          List<String> extractedSkills, List<String> missingSkills,
                          List<String> recommendedRoles, List<String> techQuestions,
                          List<String> hrQuestions, List<String> projectQuestions,
                          SectionAnalysis sectionAnalysis) {
        this.user = user;
        this.filename = filename;
        this.score = score;
        this.resumeIq = resumeIq;
        this.summary = summary;
        this.strengths = strengths;
        this.improvements = improvements;
        this.extractedSkills = extractedSkills;
        this.missingSkills = missingSkills;
        this.recommendedRoles = recommendedRoles;
        this.techQuestions = techQuestions;
        this.hrQuestions = hrQuestions;
        this.projectQuestions = projectQuestions;
        this.sectionAnalysis = sectionAnalysis;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public double getResumeIq() { return resumeIq; }
    public void setResumeIq(double resumeIq) { this.resumeIq = resumeIq; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<String> getStrengths() { return strengths; }
    public void setStrengths(List<String> strengths) { this.strengths = strengths; }

    public List<String> getImprovements() { return improvements; }
    public void setImprovements(List<String> improvements) { this.improvements = improvements; }

    public List<String> getExtractedSkills() { return extractedSkills; }
    public void setExtractedSkills(List<String> extractedSkills) { this.extractedSkills = extractedSkills; }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }

    public List<String> getRecommendedRoles() { return recommendedRoles; }
    public void setRecommendedRoles(List<String> recommendedRoles) { this.recommendedRoles = recommendedRoles; }

    public List<String> getTechQuestions() { return techQuestions; }
    public void setTechQuestions(List<String> techQuestions) { this.techQuestions = techQuestions; }

    public List<String> getHrQuestions() { return hrQuestions; }
    public void setHrQuestions(List<String> hrQuestions) { this.hrQuestions = hrQuestions; }

    public List<String> getProjectQuestions() { return projectQuestions; }
    public void setProjectQuestions(List<String> projectQuestions) { this.projectQuestions = projectQuestions; }

    public SectionAnalysis getSectionAnalysis() { return sectionAnalysis; }
    public void setSectionAnalysis(SectionAnalysis sectionAnalysis) { this.sectionAnalysis = sectionAnalysis; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
