package com.kumbh.repository;

import com.kumbh.entity.DonationConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DonationConfigRepository extends JpaRepository<DonationConfig, Long> {
}
