package com.example.datn.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    private static final String SECRET_KEY = "WEBSACH_SECRET_KEY_DATN_2024_SECURE_12345";
    private static final long EXPIRATION_MS = 1000L * 60 * 60 * 24;

    private Key getSignKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }


    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // láy email từ token
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    // lấy role từ token
    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    //Check xem token đã hết hạn chưa
    public boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    // Check token có hợp leje hay không
    public boolean isTokenValid(String token, String email) {
        try {
            return extractEmail(token).equals(email) && !isTokenExpired(token);
        } catch (JwtException e) {
            return false;
        }
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}