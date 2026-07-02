package com.kumbh.repository;

import com.kumbh.entity.HomepageConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HomepageConfigRepository extends JpaRepository<HomepageConfig, Long> {
}
