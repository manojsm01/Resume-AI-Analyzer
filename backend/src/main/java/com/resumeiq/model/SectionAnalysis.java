package com.resumeiq.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class SectionAnalysis {
    @Column(columnDefinition = "TEXT")
    private String contactInfo;
    @Column(columnDefinition = "TEXT")
    private String education;
    @Column(columnDefinition = "TEXT")
    private String skillsSection; // renamed to not conflict with skills list
    @Column(columnDefinition = "TEXT")
    private String projects;
    @Column(columnDefinition = "TEXT")
    private String experience;
    @Column(columnDefinition = "TEXT")
    private String certifications;

    public SectionAnalysis() {}

    public String getContactInfo() { return contactInfo; }
    public void setContactInfo(String contactInfo) { this.contactInfo = contactInfo; }

    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }

    public String getSkillsSection() { return skillsSection; }
    public void setSkillsSection(String skillsSection) { this.skillsSection = skillsSection; }

    public String getProjects() { return projects; }
    public void setProjects(String projects) { this.projects = projects; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public String getCertifications() { return certifications; }
    public void setCertifications(String certifications) { this.certifications = certifications; }
}
