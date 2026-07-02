package com.kumbh.repository;

import com.kumbh.entity.Shop;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShopRepository extends JpaRepository<Shop, Long> {

    Optional<Shop> findByShopSlugAndIsDeletedFalse(String shopSlug);

    List<Shop> findByOwnerUserIdAndIsDeletedFalse(Integer ownerUserId);

    List<Shop> findByStatusAndIsDeletedFalse(String status);

    List<Shop> findByStatusAndIsVerifiedAndIsDeletedFalse(String status, Boolean isVerified);

    boolean existsByShopSlug(String shopSlug);

    // ── Operator: search + paginate all shops ──────────────────────────
    @Query("SELECT s FROM Shop s WHERE s.isDeleted = false " +
           "AND (:status IS NULL OR s.status = :status) " +
           "AND (:verificationStatus IS NULL OR s.verificationStatus = :verificationStatus) " +
           "AND (:query IS NULL OR LOWER(s.shopName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "  OR LOWER(s.ownerName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "  OR LOWER(s.category) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "  OR LOWER(s.city) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Shop> searchShops(@Param("query") String query,
                           @Param("status") String status,
                           @Param("verificationStatus") String verificationStatus,
                           Pageable pageable);

    // ── Public: nearby shops by Haversine geo-distance ─────────────────
    @Query(value =
        "SELECT *, " +
        "(6371 * acos(cos(radians(:lat)) * cos(radians(latitude)) * " +
        " cos(radians(longitude) - radians(:lng)) + " +
        " sin(radians(:lat)) * sin(radians(latitude)))) AS distance " +
        "FROM shops " +
        "WHERE status = 'ACTIVE' AND is_deleted = false AND is_verified = true " +
        "AND (:category IS NULL OR category = :category) " +
        "HAVING distance <= :radiusKm " +
        "ORDER BY distance ASC",
        countQuery =
        "SELECT count(*) FROM shops " +
        "WHERE status = 'ACTIVE' AND is_deleted = false AND is_verified = true " +
        "AND (:category IS NULL OR category = :category)",
        nativeQuery = true)
    Page<Shop> findNearbyShops(@Param("lat") double lat,
                               @Param("lng") double lng,
                               @Param("radiusKm") double radiusKm,
                               @Param("category") String category,
                               Pageable pageable);

    // ── Public: category filter (active & verified only) ───────────────
    @Query("SELECT s FROM Shop s WHERE s.status = 'ACTIVE' AND s.isVerified = true " +
           "AND s.isDeleted = false " +
           "AND (:category IS NULL OR s.category = :category) " +
           "AND (:query IS NULL OR LOWER(s.shopName) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Shop> findPublicShops(@Param("query") String query,
                               @Param("category") String category,
                               Pageable pageable);

    // ── Aggregates for operator analytics dashboard ─────────────────────
    @Query("SELECT COUNT(s) FROM Shop s WHERE s.isDeleted = false")
    long countTotal();

    @Query("SELECT COUNT(s) FROM Shop s WHERE s.verificationStatus = 'PENDING' AND s.isDeleted = false")
    long countPendingVerification();

    @Query("SELECT COUNT(s) FROM Shop s WHERE s.status = 'ACTIVE' AND s.isVerified = true AND s.isDeleted = false")
    long countActiveVerified();
}
