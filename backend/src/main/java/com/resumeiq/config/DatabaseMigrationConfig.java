package com.resumeiq.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class DatabaseMigrationConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseMigrationConfig.class);

    @Bean
    public CommandLineRunner migrateDatabaseColumns(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                log.info("Running database migration to alter varchar columns to TEXT and add resume_iq...");
                try { jdbcTemplate.execute("ALTER TABLE resume_analyses ADD COLUMN IF NOT EXISTS resume_iq DOUBLE PRECISION DEFAULT 0.0"); } catch (Exception e) {}
                jdbcTemplate.execute("ALTER TABLE resume_analyses ALTER COLUMN certifications TYPE TEXT");
                jdbcTemplate.execute("ALTER TABLE resume_analyses ALTER COLUMN contact_info TYPE TEXT");
                jdbcTemplate.execute("ALTER TABLE resume_analyses ALTER COLUMN education TYPE TEXT");
                jdbcTemplate.execute("ALTER TABLE resume_analyses ALTER COLUMN experience TYPE TEXT");
                jdbcTemplate.execute("ALTER TABLE resume_analyses ALTER COLUMN projects TYPE TEXT");
                jdbcTemplate.execute("ALTER TABLE resume_analyses ALTER COLUMN skills_section TYPE TEXT");
                
                try { jdbcTemplate.execute("ALTER TABLE resume_hr_questions ALTER COLUMN question TYPE TEXT"); } catch (Exception e) {}
                try { jdbcTemplate.execute("ALTER TABLE resume_tech_questions ALTER COLUMN question TYPE TEXT"); } catch (Exception e) {}
                try { jdbcTemplate.execute("ALTER TABLE resume_project_questions ALTER COLUMN question TYPE TEXT"); } catch (Exception e) {}
                try { jdbcTemplate.execute("ALTER TABLE resume_improvements ALTER COLUMN improvement TYPE TEXT"); } catch (Exception e) {}
                try { jdbcTemplate.execute("ALTER TABLE resume_strengths ALTER COLUMN strength TYPE TEXT"); } catch (Exception e) {}
                try { jdbcTemplate.execute("ALTER TABLE resume_recommended_roles ALTER COLUMN role TYPE TEXT"); } catch (Exception e) {}
                
                log.info("Database migration successful!");
            } catch (Exception e) {
                log.warn("Database migration skipped or failed (columns might already be TEXT or tables don't exist yet): {}", e.getMessage());
            }
        };
    }
}
