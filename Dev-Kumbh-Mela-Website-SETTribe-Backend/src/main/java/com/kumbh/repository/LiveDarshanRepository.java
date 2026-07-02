package com.kumbh.repository;

import com.kumbh.entity.LiveDarshan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LiveDarshanRepository extends JpaRepository<LiveDarshan, Long> {
    List<LiveDarshan> findAllByOrderByCreatedAtDesc();

    @Query("SELECT l FROM LiveDarshan l WHERE " +
           "LOWER(l.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(l.location) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(l.status) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<LiveDarshan> searchDarshans(@Param("query") String query, Pageable pageable);
}
