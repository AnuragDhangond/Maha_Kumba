package com.kumbh.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        Long userId = null;
        String jwt = null;
        String role = null;

        // 1. Get token from HttpOnly Cookie
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwtToken".equals(cookie.getName())) {
                    jwt = cookie.getValue();
                    break;
                }
            }
        }

        // 2. Fallback to Authorization Header
        if (jwt == null) {
            String authorizationHeader = request.getHeader("Authorization");
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                jwt = authorizationHeader.substring(7);
            }
        }

        if (jwt != null) {
            try {
                String extractedUserId = jwtUtil.extractUserId(jwt);
                if (extractedUserId != null) {
                    userId = Long.valueOf(extractedUserId);
                    role = jwtUtil.extractRole(jwt);
                }
            } catch (Exception e) {
                System.out.println("JWT Token processing error: " + e.getMessage());
            }
        }

        if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            if (jwtUtil.validateToken(jwt, userId)) {

                List<GrantedAuthority> authorities;
                if (role != null) {
                    String upperRole = role.toUpperCase();
                    if ("ADMIN".equals(upperRole)) {
                        authorities = java.util.Arrays.asList(
                            new SimpleGrantedAuthority("admin"),
                            new SimpleGrantedAuthority("ADMIN"),
                            new SimpleGrantedAuthority("ROLE_ADMIN")
                        );
                    } else if ("OPERATOR".equals(upperRole)) {
                        authorities = java.util.Arrays.asList(
                            new SimpleGrantedAuthority("operator"),
                            new SimpleGrantedAuthority("OPERATOR"),
                            new SimpleGrantedAuthority("ROLE_OPERATOR")
                        );
                    } else if ("USER".equals(upperRole)) {
                        authorities = java.util.Arrays.asList(
                            new SimpleGrantedAuthority("user"),
                            new SimpleGrantedAuthority("USER"),
                            new SimpleGrantedAuthority("ROLE_USER")
                        );
                    } else {
                        authorities = Collections.singletonList(new SimpleGrantedAuthority(role));
                    }
                } else {
                    authorities = Collections.emptyList();
                }

                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                        userId, null, authorities);
                
                usernamePasswordAuthenticationToken
                        .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
        }
        chain.doFilter(request, response);
    }
}
