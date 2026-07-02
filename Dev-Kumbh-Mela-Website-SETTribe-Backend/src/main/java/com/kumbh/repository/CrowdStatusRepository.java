package com.kumbh.repository;

import com.kumbh.entity.CrowdStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CrowdStatusRepository extends JpaRepository<CrowdStatus, Long> {
}
