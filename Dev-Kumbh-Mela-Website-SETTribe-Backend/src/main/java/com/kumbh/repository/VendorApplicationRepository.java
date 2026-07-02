package com.kumbh.repository;

import com.kumbh.entity.VendorApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VendorApplicationRepository extends JpaRepository<VendorApplication, Long> {

    Optional<VendorApplication> findByUserId(Integer userId);

    boolean existsByUserId(Integer userId);

    boolean existsByShopNameIgnoreCase(String shopName);

    boolean existsByEmail(String email);

    // ── Operator paginated queue ──────────────────────────────────
    @Query("SELECT v FROM VendorApplication v WHERE " +
           "(:status IS NULL OR v.applicationStatus = :status) AND " +
           "(:query IS NULL OR LOWER(v.shopName) LIKE LOWER(CONCAT('%',:query,'%')) " +
           " OR LOWER(v.fullName) LIKE LOWER(CONCAT('%',:query,'%')) " +
           " OR LOWER(v.email) LIKE LOWER(CONCAT('%',:query,'%')))")
    Page<VendorApplication> searchApplications(@Param("query") String query,
                                               @Param("status") String status,
                                               Pageable pageable);

    // ── Dashboard counts ──────────────────────────────────────────
    long countByApplicationStatus(String status);
}
