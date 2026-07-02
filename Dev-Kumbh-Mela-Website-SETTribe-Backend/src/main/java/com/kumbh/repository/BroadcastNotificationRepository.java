package com.kumbh.repository;

import com.kumbh.entity.BroadcastNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BroadcastNotificationRepository extends JpaRepository<BroadcastNotification, Long> {
    List<BroadcastNotification> findByIsDeletedFalseOrderByCreatedAtDesc();
}