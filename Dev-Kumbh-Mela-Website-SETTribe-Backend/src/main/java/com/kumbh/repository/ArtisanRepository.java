package com.kumbh.repository;

import com.kumbh.entity.Artisan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArtisanRepository extends JpaRepository<Artisan, Long> {
    List<Artisan> findByIsActiveTrue();

    @Query("SELECT a FROM Artisan a WHERE " +
           "(:query IS NULL OR LOWER(a.artisanName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(a.craft) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(a.region) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR (:query = 'Active' AND a.isActive = true) " +
           "OR (:query = 'Inactive' AND a.isActive = false))")
    Page<Artisan> searchArtisans(@Param("query") String query, Pageable pageable);
}
