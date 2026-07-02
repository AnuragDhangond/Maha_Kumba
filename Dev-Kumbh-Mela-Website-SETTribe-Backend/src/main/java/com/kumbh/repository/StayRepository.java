package com.kumbh.repository;

import com.kumbh.entity.Stay;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StayRepository extends JpaRepository<Stay, Long> {
    List<Stay> findByCategory(String category);

    @Query("SELECT s FROM Stay s WHERE " +
           "LOWER(s.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(CAST(s.category AS string)) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "EXISTS (SELECT f FROM s.features f WHERE LOWER(f) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Stay> searchStays(@Param("search") String search, Pageable pageable);

    boolean existsByTitleAndCategoryAndPrice(String title, com.kumbh.entity.StayCategory category, Long price);
}
