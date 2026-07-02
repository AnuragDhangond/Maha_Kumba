package com.kumbh.repository;

import com.kumbh.entity.PoojaSchedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PoojaScheduleRepository extends JpaRepository<PoojaSchedule, Long> {
    
    @Query("SELECT p FROM PoojaSchedule p WHERE " +
           "LOWER(p.deity) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.specialPooja) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.place) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.day) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<PoojaSchedule> searchSchedules(@Param("search") String search, Pageable pageable);
}
