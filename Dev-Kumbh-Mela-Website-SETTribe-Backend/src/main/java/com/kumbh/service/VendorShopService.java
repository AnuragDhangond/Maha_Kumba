package com.kumbh.service;

import com.kumbh.dto.ShopDto;
import com.kumbh.dto.ShopVerifyDto;
import com.kumbh.dto.ProductDto;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * VendorShopService — governs the full Shop entity lifecycle.
 *
 * Callers:
 *  - VendorShopController   (SHOP_OWNER role)
 *  - OperatorShopController (OPERATOR / ADMIN role — verification workflow)
 *  - PublicMarketController (public, read-only endpoints)
 */
public interface VendorShopService {

    // ── VENDOR: Shop Registration & Management ─────────────────────
    ShopDto registerShop(ShopDto dto, Integer ownerUserId);
    ShopDto updateShop(Long shopId, ShopDto dto, Integer ownerUserId);
    ShopDto getMyShop(Integer ownerUserId);
    ShopDto uploadShopImages(Long shopId, MultipartFile logo, MultipartFile banner, Integer ownerUserId);
    void deleteShop(Long shopId, Integer ownerUserId);

    // ── VENDOR: Product Management (shop-scoped) ───────────────────
    ProductDto addProduct(Long shopId, ProductDto dto, MultipartFile image, Integer ownerUserId);
    ProductDto updateProduct(Long shopId, Long productId, ProductDto dto, MultipartFile image, Integer ownerUserId);
    void deleteProduct(Long shopId, Long productId, Integer ownerUserId);
    Page<ProductDto> getMyProducts(Long shopId, String search, String category,
                                   Integer page, Integer size, Integer ownerUserId);

    // ── VENDOR: Order analytics (shop-scoped) ──────────────────────
    Page<com.kumbh.dto.ShopOrderDto> getMyOrders(Long shopId, String status,
                                                  Integer page, Integer size, Integer ownerUserId);

    // ── OPERATOR: Verification workflow ────────────────────────────
    Page<ShopDto> getAllShops(String query, String status, String verificationStatus,
                              Integer page, Integer size, String sortBy, String direction);
    ShopDto getShopById(Long shopId);
    ShopDto verifyShop(Long shopId, ShopVerifyDto dto, String operatorEmail);
    ShopDto suspendShop(Long shopId, String reason, String operatorEmail);
    ShopDto reactivateShop(Long shopId, String operatorEmail);

    // ── PUBLIC: Discovery ──────────────────────────────────────────
    Page<ShopDto> getPublicShops(String query, String category, Integer page, Integer size);
    ShopDto getShopBySlug(String slug);
    Page<ShopDto> getNearbyShops(double lat, double lng, double radiusKm,
                                  String category, Integer page, Integer size);
    Page<ProductDto> getProductsByShop(Long shopId, String category, Integer page, Integer size);

    // ── OPERATOR: Dashboard analytics ─────────────────────────────
    ShopAnalyticsDto getShopAnalytics();

    /**
     * Lightweight analytics snapshot for the operator dashboard.
     */
    class ShopAnalyticsDto {
        public long totalShops;
        public long pendingVerification;
        public long activeVerifiedShops;
        public long pendingOrders;
        public java.math.BigDecimal totalRevenue;
    }
}
