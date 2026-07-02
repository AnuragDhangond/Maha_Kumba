package com.kumbh.repository;

import com.kumbh.entity.SafetyResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SafetyResourceRepository extends JpaRepository<SafetyResource, Long> {

    @Query("SELECT r FROM SafetyResource r WHERE " +
           "LOWER(r.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.type) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.status) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.address) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<SafetyResource> searchResources(@Param("query") String query, Pageable pageable);
    
    Page<SafetyResource> findByType(String type, Pageable pageable);
}
