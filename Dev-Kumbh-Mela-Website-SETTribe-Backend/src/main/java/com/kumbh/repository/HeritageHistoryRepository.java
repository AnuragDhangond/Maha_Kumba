package com.kumbh.repository;

import com.kumbh.entity.HeritageHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HeritageHistoryRepository extends JpaRepository<HeritageHistory, Long> {
    List<HeritageHistory> findByStatus(String status);
    Page<HeritageHistory> findByTitleContainingIgnoreCaseOrHeadingContainingIgnoreCase(String title, String heading, Pageable pageable);
}
