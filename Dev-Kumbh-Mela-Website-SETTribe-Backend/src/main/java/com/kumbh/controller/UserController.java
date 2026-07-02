package com.kumbh.controller;

import com.kumbh.dto.LoginDto;
import com.kumbh.dto.ResetPasswordDto;
import com.kumbh.dto.UserDto;
import com.kumbh.entity.User;
import jakarta.validation.Valid;
import com.kumbh.mapper.EntityDtoMapper;
import com.kumbh.security.JwtUtil;
import com.kumbh.service.UserService;
import com.kumbh.service.AccessTokenService;
import com.kumbh.service.AdminSettingsService;
import com.kumbh.entity.AdminSettings;

import org.springframework.beans.factory.annotation.Autowired;
import com.kumbh.service.RefreshTokenService;
import com.kumbh.entity.RefreshToken;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/users", "/api/users"})
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private AccessTokenService accessTokenService;

    @Autowired
    private AdminSettingsService adminSettingsService;

    private boolean isSecureRequest(jakarta.servlet.http.HttpServletRequest request) {
        if (request == null) return false;
        String xForwardedProto = request.getHeader("X-Forwarded-Proto");
        return request.isSecure() || "https".equalsIgnoreCase(xForwardedProto);
    }

    private ResponseCookie buildCookie(String name, String value, long durationMs, boolean secure) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite(secure ? "None" : "Lax")
                .path("/")
                .maxAge(durationMs / 1000)
                .build();
    }

    private ResponseCookie buildJwtCookie(String token, boolean secure) {
        return buildCookie("jwtToken", token, jwtUtil.getAccessTokenDurationMs(), secure);
    }

    private ResponseCookie buildRefreshCookie(String token, boolean secure) {
        return buildCookie("refreshToken", token, refreshTokenService.getRefreshTokenDurationMs(), secure);
    }

    private Long getUserIdFromContext() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal == null || principal.equals("anonymousUser")) {
            return null;
        }
        return (Long) principal;
    }

    // REGISTER USER
    @PostMapping("/register")
    public UserDto registerUser(@Valid @RequestBody UserDto userDto) {
        AdminSettings settings = adminSettingsService.getSettings();
        if (settings != null && !settings.isPublicRegistration()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Public registration is currently disabled by administration");
        }
        
        if (userDto.getPassword() == null || userDto.getPassword().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required for registration");
        }
        User user = EntityDtoMapper.toUserEntity(userDto);
        return EntityDtoMapper.toUserDto(userService.saveUser(user));
    }

    // CHECK EMAIL EXISTS
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Object>> checkEmailExists(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();
        
        if (email == null || email.isEmpty()) {
            response.put("valid", false);
            response.put("exists", false);
            response.put("message", "Email is required");
            return ResponseEntity.ok(response);
        }

        if (!email.contains("@")) {
            response.put("valid", false);
            response.put("exists", false);
            response.put("message", "Email must contain @");
            return ResponseEntity.ok(response);
        }
        
        String lowerEmail = email.toLowerCase();
        List<String> validExtensions = Arrays.asList(".com", ".in", ".org", ".net", ".info", ".biz");
        boolean hasValidExtension = validExtensions.stream().anyMatch(lowerEmail::endsWith);
                                
        if (!hasValidExtension) {
            response.put("valid", false);
            response.put("exists", false);
            response.put("message", "Email must end with .com, .in, .org, .net, .info or .biz");
            return ResponseEntity.ok(response);
        }
        
        // General regex for further validation
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        if (!email.matches(emailRegex)) {
            response.put("valid", false);
            response.put("exists", false);
            response.put("message", "Invalid email format");
            return ResponseEntity.ok(response);
        }
        
        boolean exists = userService.existsByEmail(email);
        response.put("valid", true);
        response.put("exists", exists);
        response.put("message", exists ? "Email id already exist" : "Email is available");
        
        return ResponseEntity.ok(response);
    }

    // CHECK PASSWORD VALIDITY
    @PostMapping("/check-password")
    public ResponseEntity<Map<String, Object>> checkPassword(@RequestBody Map<String, String> request) {
        String password = request.get("password");
        String email = request.get("email");
        String name = request.get("name");
        
        Map<String, Object> response = new HashMap<>();
        
        if (password == null || password.isEmpty()) {
            response.put("valid", false);
            response.put("message", "Password is required");
            return ResponseEntity.ok(response);
        }

        if (password.length() < 8 || password.length() > 12) {
            response.put("valid", false);
            response.put("message", "Password must be 8-12 characters long");
            return ResponseEntity.ok(response);
        }

        if (!password.matches(".*[A-Z].*")) {
            response.put("valid", false);
            response.put("message", "Password must include at least one uppercase letter");
            return ResponseEntity.ok(response);
        }

        if (!password.matches(".*[a-z].*")) {
            response.put("valid", false);
            response.put("message", "Password must include at least one lowercase letter");
            return ResponseEntity.ok(response);
        }

        if (!password.matches(".*[0-9].*")) {
            response.put("valid", false);
            response.put("message", "Password must include at least one number");
            return ResponseEntity.ok(response);
        }

        if (!password.matches(".*[@#$%^&+=!].*")) {
            response.put("valid", false);
            response.put("message", "Password must include at least one special character");
            return ResponseEntity.ok(response);
        }

        // Check if password contains personal information
        if (email != null && !email.isEmpty() && password.toLowerCase().contains(email.split("@")[0].toLowerCase())) {
            response.put("valid", false);
            response.put("message", "Password should not contain personal information like email");
            return ResponseEntity.ok(response);
        }

        if (name != null && !name.isEmpty() && password.toLowerCase().contains(name.toLowerCase())) {
            response.put("valid", false);
            response.put("message", "Password should not contain your name");
            return ResponseEntity.ok(response);
        }

        // Check for common patterns or repeated characters
        if (password.matches("(.)\\1{2,}")) {
            response.put("valid", false);
            response.put("message", "Password should not contain repeated patterns");
            return ResponseEntity.ok(response);
        }

        response.put("valid", true);
        response.put("message", "Password is valid");
        return ResponseEntity.ok(response);
    }

    // GET ALL USERS (PAGINATED)
    @GetMapping("/all")
    public Page<UserDto> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        
        return userService.getPaginatedUsers(search, page, size, sortBy, direction);
    }

    // UPDATE USER
    @PutMapping("/update/{id}")
    public UserDto updateUser(@PathVariable int id, @Valid @RequestBody UserDto userDto) {
        User user = EntityDtoMapper.toUserEntity(userDto);
        return EntityDtoMapper.toUserDto(userService.updateUser(id, user));
    }

    // DELETE USER
    @DeleteMapping("/delete/{id}")
    public String deleteUser(@PathVariable int id) {
        userService.deleteUser(id);
        return "User Deleted";
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(jakarta.servlet.http.HttpServletRequest request) {
        try {
            Long userId = getUserIdFromContext();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            User user = userService.getUserById(userId.intValue());
                    
            return ResponseEntity.ok(EntityDtoMapper.toUserDto(user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> loginUser(@Valid @RequestBody LoginDto loginDto,
            jakarta.servlet.http.HttpServletRequest request,
            HttpServletResponse response) {

        System.out.println("Email: " + loginDto.getEmail());

        User loggedUser = userService.loginUser(loginDto.getEmail(), loginDto.getPassword());

        String token = jwtUtil.generateToken(Long.valueOf(loggedUser.getId()), loggedUser.getRole());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(Long.valueOf(loggedUser.getId()));

        // Store JWT in database
        accessTokenService.saveAccessToken(Long.valueOf(loggedUser.getId()), token, jwtUtil.getAccessTokenDurationMs());

        boolean secure = isSecureRequest(request);
        ResponseCookie jwtCookie = buildJwtCookie(token, secure);
        ResponseCookie refreshCookie = buildRefreshCookie(refreshToken.getToken(), secure);

        Map<String, String> responseBody = new HashMap<>();
        responseBody.put("message", "Logged in successfully");
        responseBody.put("token", token);
        responseBody.put("refreshToken", refreshToken.getToken());
        responseBody.put("role", loggedUser.getRole());
        responseBody.put("userId", String.valueOf(loggedUser.getId()));

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, jwtCookie.toString());
        headers.add(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return new ResponseEntity<>(responseBody, headers, HttpStatus.OK);
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String refreshTokenString,
            @RequestBody(required = false) Map<String, String> body,
            jakarta.servlet.http.HttpServletRequest request,
            HttpServletResponse response) {
        
        String tokenToUse = refreshTokenString;
        if (tokenToUse == null && body != null) {
            tokenToUse = body.get("refreshToken");
        }

        if (tokenToUse == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Refresh token missing"));
        }

        try {
            return refreshTokenService.findByToken(tokenToUse)
                    .map(refreshTokenService::verifyExpiration)
                    .map(RefreshToken::getUser)
                    .map(user -> {
                        String token = jwtUtil.generateToken(Long.valueOf(user.getId()), user.getRole());
                        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(Long.valueOf(user.getId()));

                        // Store new JWT in database
                        accessTokenService.saveAccessToken(Long.valueOf(user.getId()), token, jwtUtil.getAccessTokenDurationMs());

                        boolean secure = isSecureRequest(request);
                        ResponseCookie jwtCookie = buildJwtCookie(token, secure);
                        ResponseCookie refreshCookie = buildRefreshCookie(newRefreshToken.getToken(), secure);

                        Map<String, String> res = new HashMap<>();
                        res.put("message", "Token refreshed successfully");
                        res.put("token", token);
                        res.put("refreshToken", newRefreshToken.getToken());

                        HttpHeaders headers = new HttpHeaders();
                        headers.add(HttpHeaders.SET_COOKIE, jwtCookie.toString());
                        headers.add(HttpHeaders.SET_COOKIE, refreshCookie.toString());

                        return new ResponseEntity<>(res, headers, HttpStatus.OK);
                    }).orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid refresh token")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logoutUser(
            jakarta.servlet.http.HttpServletRequest request,
            HttpServletResponse response) {

        Long userId = getUserIdFromContext();
        if (userId != null) {
            try {
                refreshTokenService.deleteByUserId(userId);
                accessTokenService.deleteByUserId(userId);
            } catch (Exception e) {
                System.out.println("Logout error: " + e.getMessage());
            }
        }

        boolean secure = isSecureRequest(request);
        ResponseCookie jwtCookie = buildCookie("jwtToken", "", 0, secure);
        ResponseCookie refreshCookie = buildCookie("refreshToken", "", 0, secure);

        Map<String, String> res = new HashMap<>();
        res.put("message", "Logged out successfully");

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.SET_COOKIE, jwtCookie.toString(), refreshCookie.toString())
                .body(res);
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@Valid @RequestBody ResetPasswordDto resetDto) {

        String email = resetDto.getEmail();
        String newPassword = resetDto.getNewPassword();

        userService.resetPassword(email, newPassword);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password updated successfully");

        return response;
    }
}
