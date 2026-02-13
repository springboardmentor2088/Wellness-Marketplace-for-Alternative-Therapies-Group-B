package com.wellnesshub.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    // Secret key (at least 32 characters for HS256)
    private static final String SECRET = "u4R6mL9pTj2vXy7zAq1sW3eF8bC0dH5k";

    // Convert the plain string into a proper signing key
    private static final Key SECRET_KEY = Keys.hmacShaKeyFor(SECRET.getBytes());

    // Token expiration: 24 hours
    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 24;

    // Generate JWT token with custom claims
    public String generateToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    // Extract all claims from a JWT token
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Extract the username (subject) from a token
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    // Check if a token is expired
    public boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }
}
