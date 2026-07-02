package com.kumbh.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // Added BCrypt
import org.springframework.security.crypto.password.PasswordEncoder; // Added PasswordEncoder
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
public class SecurityConfig {

        @Autowired
        private JwtRequestFilter jwtRequestFilter;

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

                http
                                .cors(Customizer.withDefaults()) // Added for CORS support alongside @CrossOrigin
                                .csrf(csrf -> csrf.disable()) // disable csrf
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**")
                                                .permitAll() // allow CORS
                                                             // preflight
                                                             // for all
                                                             // endpoints
                                                .requestMatchers(
                                                                "/users/login", "/api/users/login",
                                                                "/users/register", "/api/users/register",
                                                                "/users/reset-password", "/api/users/reset-password",
                                                                "/users/me", "/api/users/me",
                                                                "/users/refresh", "/api/users/refresh",
                                                                "/users/check-email", "/api/users/check-email",
                                                                "/users/check-password", "/api/users/check-password",
                                                                "/api/activity/track", "/uploads/**"
                                                )
                                                .permitAll() // allow public access
                                                .requestMatchers("/ws-crowd/**").permitAll() // allow WebSocket handshake for guests
                                                .requestMatchers("/api/user/**")
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN", "operator", "OPERATOR",
                                                                "ROLE_OPERATOR", "user", "USER", "ROLE_USER")
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/homepage-config", "/api/admin/settings")
                                                .permitAll()
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/live-updates",
                                                                "/api/live-updates/**")
                                                .permitAll() // public read for homepage
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/weather/current",
                                                                "/api/weather/alerts",
                                                                "/api/weather/notifications")
                                                .permitAll() // public read for weather
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                "/api/public/**")
                                                .permitAll() // public read for heritage, shops and discovery
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                "/api/public/shops",
                                                "/api/public/shops/**")
                                                .permitAll() // explicit geo-discovery public
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/live-darshans",
                                                                "/api/live-darshans/**")
                                                .permitAll() // public read for Virtual Pooja
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/pooja-schedules",
                                                                "/api/pooja-schedules/**")
                                                .permitAll() // public read for pooja schedules
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/acharyas",
                                                                "/api/acharyas/**")
                                                .permitAll() // public read for acharyas
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/pooja-bookings")
                                                .permitAll() // public pooja booking submission
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/pooja-bookings",
                                                                "/api/pooja-bookings/**")
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN", "operator", "OPERATOR",
                                                                "ROLE_OPERATOR")
                                                .requestMatchers(org.springframework.http.HttpMethod.PATCH,
                                                                "/api/pooja-bookings/**")
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN", "operator", "OPERATOR",
                                                                "ROLE_OPERATOR")
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/donation-config")
                                                .permitAll() // public read for donation page settings
                                                .requestMatchers(org.springframework.http.HttpMethod.PUT,
                                                                "/api/donation-config")
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN", "operator", "OPERATOR",
                                                                "ROLE_OPERATOR")
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/donations")
                                                .permitAll() // allow public donation submission
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/donations")
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN")
                                                .requestMatchers(org.springframework.http.HttpMethod.PATCH,
                                                                "/api/donations/*/verify")
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN")
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/live-darshans")
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN", "operator", "OPERATOR",
                                                                "ROLE_OPERATOR")
                                                .requestMatchers(org.springframework.http.HttpMethod.PUT,
                                                                "/api/live-darshans/**")
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN", "operator", "OPERATOR",
                                                                "ROLE_OPERATOR")
                                                .requestMatchers(org.springframework.http.HttpMethod.DELETE,
                                                                "/api/live-darshans/**")
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN", "operator", "OPERATOR",
                                                                "ROLE_OPERATOR")
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/pooja-schedules")
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN", "operator", "OPERATOR",
                                                                "ROLE_OPERATOR")
                                                .requestMatchers(org.springframework.http.HttpMethod.PUT,
                                                                "/api/pooja-schedules/**")
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN", "operator", "OPERATOR",
                                                                "ROLE_OPERATOR")
                                                .requestMatchers(org.springframework.http.HttpMethod.DELETE,
                                                                "/api/pooja-schedules/**")
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN", "operator", "OPERATOR",
                                                                "ROLE_OPERATOR")
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/acharyas")
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN", "operator", "OPERATOR",
                                                                "ROLE_OPERATOR")
                                                .requestMatchers(org.springframework.http.HttpMethod.PUT,
                                                                "/api/acharyas/**")
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN", "operator", "OPERATOR",
                                                                "ROLE_OPERATOR")
                                                .requestMatchers(org.springframework.http.HttpMethod.DELETE,
                                                                "/api/acharyas/**")
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN", "operator", "OPERATOR",
                                                                "ROLE_OPERATOR")
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/hospitals/**", "/api/helplines/**",
                                                                "/api/health-tips", "/api/health-tips/**",
                                                                "/api/safety-resources", "/api/safety-resources/**")
                                                .permitAll() // public read for hospitals, helplines, health tips and safety resources
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/emergency/create")
                                                .permitAll()
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/emergency/status/**",
                                                                "/api/emergency/my-status")
                                                .permitAll()
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/crowd-status", "/api/crowd-status/**")
                                                .permitAll() // public read for live map
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/crowd-status/ping",
                                                                "/api/crowd-status/disconnect")
                                                .permitAll() // public GPS reporting
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/routing/**")
                                                .permitAll() // public routing for navigation
                                                .requestMatchers(org.springframework.http.HttpMethod.PUT,
                                                                "/api/crowd-status/**")
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN")
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/crowd-status/refresh-density")
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN")
                                                .requestMatchers(org.springframework.http.HttpMethod.PUT,
                                                                "/api/admin/homepage-config", "/api/admin/settings")
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN", "operator", "OPERATOR",
                                                                "ROLE_OPERATOR")
                                                .requestMatchers("/api/user/**")
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN", "operator", "OPERATOR",
                                                                "ROLE_OPERATOR", "user", "USER", "ROLE_USER")
                                                .requestMatchers("/api/hospitals/**", "/api/helplines/**",
                                                                "/api/admin/heritage/**", "/api/emergency/**",
                                                                "/api/health-tips", "/api/health-tips/**",
                                                                "/api/safety-resources/**")
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN", "operator", "OPERATOR",
                                                                "ROLE_OPERATOR")
                                                .requestMatchers("/api/operator/**")
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN", "operator", "OPERATOR",
                                                                "ROLE_OPERATOR")
                                                // Vendor Application - anyone logged in can apply
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/vendors/apply",
                                                                "/api/vendors/apply/documents")
                                                .authenticated()
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/vendors/my-application")
                                                .authenticated()
                                                // Vendor Application queue - operator only
                                                .requestMatchers("/api/vendors/queue",
                                                                "/api/vendors/*/review")
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN", "operator", "OPERATOR",
                                                                "ROLE_OPERATOR")
                                                .requestMatchers("/api/vendors/**")
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN", "operator", "OPERATOR",
                                                                "ROLE_OPERATOR")
                                                // Vendor dashboard - vendor/operator/admin only
                                                .requestMatchers("/api/vendor/**")
                                                .hasAnyAuthority("vendor", "VENDOR", "admin", "ADMIN", "operator", "OPERATOR")
                                                .requestMatchers(
                                                                "/users/all", "/api/users/all",
                                                                "/users/delete/**", "/api/users/delete/**",
                                                                "/api/activity/all",
                                                                "/api/activity/total-users",
                                                                "/api/activity/today-overview"
                                                )
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN", "operator", "OPERATOR",
                                                                "ROLE_OPERATOR") // allow admin and operator roles
                                                .requestMatchers("/api/stays/**", "/api/travel-groups/**").permitAll() // Permit all for these
                                                                                              // endpoints to resolve
                                                                                              // 403/400 issues
                                                .requestMatchers(
                                                                "/users/all", "/api/users/all",
                                                                "/users/delete/**", "/api/users/delete/**",
                                                                "/api/activity/all",
                                                                "/api/activity/total-users",
                                                                "/api/activity/today-overview"
                                                )
                                                .hasAnyAuthority("admin", "ADMIN", "ROLE_ADMIN") // require admin role
                                                .anyRequest().authenticated() // require authentication for all other
                                                                              // APIs
                                )
                                .formLogin(form -> form.disable()) // disable default login page
                                .httpBasic(basic -> basic.disable()); // disable basic auth popup

                http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();

                // Allowed origins with specific production URL and wildcard for development
                configuration.setAllowedOriginPatterns(Arrays.asList(
                    "http://localhost:*",
                    "https://mahakumbh-website-frontend.onrender.com",
                    "https://*.onrender.com"
                ));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
                configuration.setAllowedHeaders(Arrays.asList("*")); 
                configuration.setAllowCredentials(true);
                configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", "Set-Cookie"));

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}