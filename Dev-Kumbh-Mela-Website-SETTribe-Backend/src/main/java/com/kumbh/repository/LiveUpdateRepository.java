package com.kumbh.repository;

import com.kumbh.entity.LiveUpdate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LiveUpdateRepository extends JpaRepository<LiveUpdate, Long> {
    List<LiveUpdate> findAllByOrderByCreatedAtDesc();
    List<LiveUpdate> findByIsFeaturedTrueOrderByCreatedAtDesc();

    @Query("SELECT l FROM LiveUpdate l WHERE " +
           "(:category IS NULL OR l.category = :category) AND " +
           "(:search IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(l.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(l.location) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY l.createdAt DESC")
    Page<LiveUpdate> findWithFilters(@Param("search") String search, 
                                    @Param("category") String category, 
                                    Pageable pageable);

    boolean existsByTitleAndStartTimeAndLocation(String title, java.time.LocalTime startTime, String location);

    boolean existsByTitleAndLocation(String title, String location);
}
