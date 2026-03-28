package com.example.datn.exception;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ErrorResponse {
    private int status;
    private String error;
    private Object message;
    private LocalDateTime timestamp;

    public ErrorResponse(int status, String error, Object message) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
}
