package com.kumbh.repository;

import com.kumbh.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // ── Legacy / backward-compat queries ────────────────────────────
    List<Product> findByIsDeletedFalse();
    List<Product> findByIsActiveTrueAndIsDeletedFalse();
    List<Product> findByCategoryAndIsActiveTrueAndIsDeletedFalse(String category);

    // ── Shop-scoped queries (used by vendor dashboard & public shop view) ─
    List<Product> findByShopIdAndIsDeletedFalse(Long shopId);
    List<Product> findByShopIdAndIsActiveTrueAndIsDeletedFalse(Long shopId);
    Page<Product> findByShopIdAndIsDeletedFalse(Long shopId, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.shopId = :shopId AND p.isDeleted = false")
    long countByShopId(@Param("shopId") Long shopId);

    // ── Public search (active, non-deleted products across all verified shops) ─
    @Query("SELECT p FROM Product p WHERE p.isDeleted = false AND p.isActive = true " +
           "AND p.moderationStatus = 'APPROVED' " +
           "AND p.visibleInMarketplace = true " +
           "AND (:shopId IS NULL OR p.shopId = :shopId) " +
           "AND (:category IS NULL OR LOWER(p.category) = LOWER(:category)) " +
           "AND (:query IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%',:query,'%')) " +
           "  OR LOWER(p.description) LIKE LOWER(CONCAT('%',:query,'%')) " +
           "  OR LOWER(p.tags) LIKE LOWER(CONCAT('%',:query,'%')))")
    Page<Product> searchPublicProducts(@Param("query") String query,
                                       @Param("shopId") Long shopId,
                                       @Param("category") String category,
                                       Pageable pageable);

    // ── Operator: get products pending moderation ─────────────────
    @Query("SELECT p FROM Product p WHERE p.isDeleted = false AND p.moderationStatus = 'PENDING' " +
           "ORDER BY p.createdAt ASC")
    Page<Product> findPendingApproval(Pageable pageable);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.isDeleted = false AND p.moderationStatus = 'PENDING'")
    long countPendingApproval();

    // ── Seller: track own submissions ─────────────────────────────
    List<Product> findBySubmittedByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(Integer userId);

    // ── Operator full-text search ────────────────────────────────────
    @Query("SELECT p FROM Product p WHERE p.isDeleted = false " +
           "AND (:query IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "  OR LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "  OR (:query = 'Active' AND p.isActive = true) " +
           "  OR (:query = 'Inactive' AND p.isActive = false))")
    Page<Product> searchProducts(@Param("query") String query, Pageable pageable);
}
