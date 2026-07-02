package com.kumbh.repository;

import com.kumbh.entity.AccessToken;
import com.kumbh.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccessTokenRepository extends JpaRepository<AccessToken, Long> {

    Optional<AccessToken> findByToken(String token);
    
    void deleteByUser(User user);
}
