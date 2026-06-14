package com.resumeiq.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "geminiTaskExecutor")
    public Executor geminiTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(20);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("GeminiAsync-");
        
        // Ensure graceful shutdown: wait for active tasks to complete
        executor.setWaitForTasksToCompleteOnShutdown(true);
        // Timeout for waiting for tasks to complete
        executor.setAwaitTerminationSeconds(30);
        
        executor.initialize();
        return executor;
    }
}
