package com.kumbh.repository;

import com.kumbh.entity.HealthTip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthTipRepository extends JpaRepository<HealthTip, Long> {
    List<HealthTip> findByCategory(String category);
}
