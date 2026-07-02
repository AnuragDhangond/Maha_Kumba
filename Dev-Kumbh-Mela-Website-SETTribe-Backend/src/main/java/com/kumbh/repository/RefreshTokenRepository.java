package com.kumbh.repository;

import com.kumbh.entity.RefreshToken;
import com.kumbh.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);
    
    // We can delete their old token if they login again
    void deleteByUser(User user);
}
