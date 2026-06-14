package com.resumeiq.dto;

public record RegisterRequest(
    String firstName,
    String lastName,
    String email,
    String password
) {}
