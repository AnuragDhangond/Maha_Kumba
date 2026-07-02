package com.kumbh.repository;

import com.kumbh.entity.KumbhHighlight;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KumbhHighlightRepository extends JpaRepository<KumbhHighlight, Long> {
    List<KumbhHighlight> findByStatusOrderByDisplayOrderAsc(String status);
    
    Page<KumbhHighlight> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrYearContainingIgnoreCase(
            String title, String description, String year, Pageable pageable);
}
