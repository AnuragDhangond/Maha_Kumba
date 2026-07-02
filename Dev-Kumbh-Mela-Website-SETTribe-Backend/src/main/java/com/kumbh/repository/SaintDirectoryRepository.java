package com.kumbh.repository;

import com.kumbh.entity.SaintDirectory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SaintDirectoryRepository extends JpaRepository<SaintDirectory, Long> {
    List<SaintDirectory> findByStatusOrderByDisplayOrderAsc(String status);

    Page<SaintDirectory> findByNameContainingIgnoreCaseOrAkhadaContainingIgnoreCaseOrRoleContainingIgnoreCase(
            String name, String akhada, String role, Pageable pageable);
}
