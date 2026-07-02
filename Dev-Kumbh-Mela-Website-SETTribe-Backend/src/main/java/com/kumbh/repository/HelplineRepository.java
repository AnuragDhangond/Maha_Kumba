package com.kumbh.repository;

import com.kumbh.entity.Helpline;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HelplineRepository extends JpaRepository<Helpline, Long> {

    @Query("SELECT h FROM Helpline h WHERE h.status = 'ACTIVE' AND (" +
           "LOWER(h.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(h.status) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(h.number) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Helpline> searchHelplines(@Param("query") String query, Pageable pageable);

    @Query("SELECT h FROM Helpline h WHERE h.status = 'ACTIVE'")
    Page<Helpline> findAllActive(Pageable pageable);

    @Modifying
    @Query("UPDATE Helpline h SET h.status = 'INACTIVE' WHERE h.id = :id")
    void deactivateHelpline(@Param("id") Long id);

    boolean existsByNameAndStatus(String name, String status);
    boolean existsByNumberAndStatus(String number, String status);
}
