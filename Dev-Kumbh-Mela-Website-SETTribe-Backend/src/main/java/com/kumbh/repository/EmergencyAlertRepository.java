package com.kumbh.repository;

import com.kumbh.entity.EmergencyAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EmergencyAlertRepository extends JpaRepository<EmergencyAlert, Long> {

    @Query(value = "SELECT alert_id FROM emergency_alerts ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Optional<String> findLastAlertId();

    Optional<EmergencyAlert> findByAlertId(String alertId);

    @Query("SELECT e FROM EmergencyAlert e WHERE " +
           "LOWER(e.alertId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.emergencyType) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.status) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.priority) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "CAST(e.latitude AS string) LIKE CONCAT('%', :query, '%') OR " +
           "CAST(e.longitude AS string) LIKE CONCAT('%', :query, '%')")
    Page<EmergencyAlert> searchAlerts(@Param("query") String query, Pageable pageable);
}
