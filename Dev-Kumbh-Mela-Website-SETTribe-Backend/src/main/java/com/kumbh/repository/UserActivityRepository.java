// Added for user activity tracking
package com.kumbh.repository;

import com.kumbh.entity.UserActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {
    
    @Query("SELECT u FROM UserActivity u WHERE " +
           "LOWER(u.ipAddress) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.pageVisited) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "CAST(u.id AS string) LIKE CONCAT('%', :query, '%') OR " +
           "CONCAT('V-', u.id) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<UserActivity> searchActivities(@Param("query") String query, Pageable pageable);

    @Query("SELECT COUNT(DISTINCT u.ipAddress) FROM UserActivity u")
    long countDistinctIpAddresses();

    @Query("SELECT COUNT(DISTINCT u.ipAddress) FROM UserActivity u WHERE u.createdAt >= :since " +
           "AND u.ipAddress NOT IN (SELECT u2.ipAddress FROM UserActivity u2 WHERE u2.createdAt < :since)")
    long countNewUsersSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(DISTINCT u.ipAddress) FROM UserActivity u WHERE u.createdAt >= :start AND u.createdAt < :end " +
           "AND u.ipAddress NOT IN (SELECT u2.ipAddress FROM UserActivity u2 WHERE u2.createdAt < :start)")
    long countNewUsersBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(DISTINCT u.ipAddress) FROM UserActivity u WHERE u.createdAt >= :since")
    long countDistinctIpAddressesSince(@Param("since") LocalDateTime since);
}
