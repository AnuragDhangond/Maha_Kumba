package com.kumbh.repository;

import com.kumbh.entity.Acharya;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AcharyaRepository extends JpaRepository<Acharya, Long> {

    @Query("SELECT a FROM Acharya a WHERE " +
           "LOWER(a.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.specialty) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.location) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Acharya> searchAcharyas(@Param("search") String search, Pageable pageable);
}
