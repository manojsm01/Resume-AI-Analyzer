package com.resumeiq.dto;

public record AuthenticationRequest(
    String email,
    String password
) {}
