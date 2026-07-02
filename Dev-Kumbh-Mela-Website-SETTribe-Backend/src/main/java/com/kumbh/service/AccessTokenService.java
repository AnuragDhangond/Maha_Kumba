package com.kumbh.service;

import com.kumbh.entity.AccessToken;
import com.kumbh.entity.User;
import com.kumbh.repository.AccessTokenRepository;
import com.kumbh.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
public class AccessTokenService {

    @Autowired
    private AccessTokenRepository accessTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public AccessToken saveAccessToken(Long userId, String token, long durationMs) {
        
        userRepository.findById(userId.intValue()).ifPresent(user -> {
            accessTokenRepository.deleteByUser(user);
        });
        
        accessTokenRepository.flush();

        AccessToken accessToken = new AccessToken();
        accessToken.setUser(userRepository.findById(userId.intValue()).get());
        accessToken.setToken(token);
        accessToken.setExpiryDate(Instant.now().plusMillis(durationMs));

        return accessTokenRepository.save(accessToken);
    }

    public Optional<AccessToken> findByToken(String token) {
        return accessTokenRepository.findByToken(token);
    }

    @Transactional
    public void deleteByUserId(Long userId) {
        userRepository.findById(userId.intValue()).ifPresent(user -> {
            accessTokenRepository.deleteByUser(user);
        });
    }
}
