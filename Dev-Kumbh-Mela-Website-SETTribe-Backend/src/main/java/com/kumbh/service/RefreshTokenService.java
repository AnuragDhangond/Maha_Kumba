package com.kumbh.service;

import com.kumbh.entity.RefreshToken;
import com.kumbh.repository.RefreshTokenRepository;
import com.kumbh.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    // Refresh token lifetime: 7 days
    private static final long REFRESH_TOKEN_DURATION_MS = 7L * 24 * 60 * 60 * 1000;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public RefreshToken createRefreshToken(Long userId) {

        // 🔥 Delete old token
        deleteByUserId(userId);

        // 🔥 FORCE DB execution immediately
        refreshTokenRepository.flush();

        RefreshToken refreshToken = new RefreshToken();

        refreshToken.setUser(userRepository.findById(userId.intValue()).get());
        refreshToken.setExpiryDate(Instant.now().plusMillis(REFRESH_TOKEN_DURATION_MS));
        refreshToken.setToken(UUID.randomUUID().toString());

        return refreshTokenRepository.save(refreshToken);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException(token.getToken() + " Refresh token was expired. Please make a new signin request");
        }
        return token;
    }

    @Transactional
    public void deleteByUserId(Long userId) {
        refreshTokenRepository.deleteByUser(userRepository.findById(userId.intValue()).get());
    }

    public long getRefreshTokenDurationMs() {
        return REFRESH_TOKEN_DURATION_MS;
    }
}
