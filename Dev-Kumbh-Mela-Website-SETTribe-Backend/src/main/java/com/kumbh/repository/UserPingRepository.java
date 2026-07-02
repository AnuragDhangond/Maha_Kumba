package com.kumbh.repository;

import com.kumbh.entity.UserPing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

import java.util.Optional;

@Repository
public interface UserPingRepository extends JpaRepository<UserPing, Long> {
    
    Optional<UserPing> findByDeviceId(String deviceId);
    
    void deleteByDeviceId(String deviceId);
    
    // Find pings updated in the last 10 minutes to ensure "Live" status
    List<UserPing> findByTimestampAfter(LocalDateTime timestamp);
    
    // Clear old pings periodically
    void deleteByTimestampBefore(LocalDateTime timestamp);
}
