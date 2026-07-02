package com.kumbh.repository;

import com.kumbh.entity.ShopOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShopOrderRepository extends JpaRepository<ShopOrder, Long> {

    Optional<ShopOrder> findByOrderNumber(String orderNumber);
    List<ShopOrder> findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(Integer userId);
    List<ShopOrder> findByOrderStatus(String orderStatus);

    // ── Vendor-scoped queries ────────────────────────────────────────
    List<ShopOrder> findByShopIdAndIsDeletedFalse(Long shopId);
    Page<ShopOrder> findByShopIdAndIsDeletedFalse(Long shopId, Pageable pageable);
    List<ShopOrder> findByVendorIdAndIsDeletedFalse(Integer vendorId);

    @Query("SELECT COUNT(o) FROM ShopOrder o WHERE o.shopId = :shopId AND o.isDeleted = false")
    long countByShopId(@Param("shopId") Long shopId);

    @Query("SELECT COALESCE(SUM(o.grandTotal), 0) FROM ShopOrder o " +
           "WHERE o.shopId = :shopId AND o.orderStatus = 'DELIVERED' AND o.isDeleted = false")
    java.math.BigDecimal sumRevenueByShopId(@Param("shopId") Long shopId);

    // ── Operator paginated search (all orders) ───────────────────────
    @Query("SELECT o FROM ShopOrder o WHERE o.isDeleted = false " +
           "AND (:status IS NULL OR o.orderStatus = :status) " +
           "AND (:paymentStatus IS NULL OR o.paymentStatus = :paymentStatus) " +
           "AND (:shopId IS NULL OR o.shopId = :shopId) " +
           "AND (:query IS NULL OR LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "  OR LOWER(o.customerName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "  OR LOWER(o.phone) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<ShopOrder> searchOrders(@Param("query") String query,
                                  @Param("status") String status,
                                  @Param("paymentStatus") String paymentStatus,
                                  @Param("shopId") Long shopId,
                                  Pageable pageable);

    // ── Operator analytics aggregates ────────────────────────────────
    @Query("SELECT COUNT(o) FROM ShopOrder o WHERE o.orderStatus = 'PENDING' AND o.isDeleted = false")
    long countPendingOrders();

    @Query("SELECT COALESCE(SUM(o.grandTotal), 0) FROM ShopOrder o " +
           "WHERE o.orderStatus = 'DELIVERED' AND o.isDeleted = false")
    java.math.BigDecimal sumTotalRevenue();
}
