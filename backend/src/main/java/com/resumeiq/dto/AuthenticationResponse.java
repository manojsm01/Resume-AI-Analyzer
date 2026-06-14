package com.resumeiq.dto;

public record AuthenticationResponse(
    String token,
    String role
) {}
