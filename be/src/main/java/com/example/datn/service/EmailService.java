package com.example.datn.service;

public interface EmailService {
    void sendHtmlEmail(String to, String subject, String htmlContent);
}
