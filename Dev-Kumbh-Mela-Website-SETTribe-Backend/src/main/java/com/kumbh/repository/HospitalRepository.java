package com.kumbh.repository;

import java.util.List;
import com.kumbh.entity.Hospital;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    boolean existsByName(String name);
    boolean existsByContact(String contact);
    boolean existsByLatitude(Double latitude);
    boolean existsByLongitude(Double longitude);

    @Query("SELECT h FROM Hospital h WHERE " +
           "LOWER(h.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(h.contact) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(h.status) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(h.address) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Hospital> searchHospitals(@Param("query") String query, Pageable pageable);
}
