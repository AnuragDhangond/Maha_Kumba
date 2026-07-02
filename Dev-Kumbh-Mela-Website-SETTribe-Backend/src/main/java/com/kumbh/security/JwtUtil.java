package com.kumbh.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.nio.charset.StandardCharsets;

@Component
public class JwtUtil {

    // Access token lifetime: 15 minutes
    private static final long ACCESS_TOKEN_DURATION_MS = 15L * 60 * 1000;

    private final String secret;
    private final Key key;

    public JwtUtil(@Value("${jwt.secret:KumbhMelaDefaultSecretKey2024ForJWTTokenGeneration}") String secret) {
        this.secret = secret;
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // Generate Token using userId and role
    public String generateToken(Long userId, String role) {

        return Jwts.builder()
                .claim("role", role)
                .setSubject(String.valueOf(userId)) 
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_DURATION_MS))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public long getAccessTokenDurationMs() {
        return ACCESS_TOKEN_DURATION_MS; 
    }

    // Extract userId
    public String extractUserId(String token) {

        return getClaims(token).getSubject();
    }

    // Extract role
    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    public boolean isTokenExpired(String token) {

        return getClaims(token).getExpiration().before(new Date());
    }

    // Validate Token
    public boolean validateToken(String token, Long userId) {

        String extractedUserId = extractUserId(token);
        return (extractedUserId.equals(String.valueOf(userId)) && !isTokenExpired(token));
    }

    private Claims getClaims(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
