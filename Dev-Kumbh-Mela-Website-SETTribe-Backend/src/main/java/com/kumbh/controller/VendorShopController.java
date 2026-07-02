package com.kumbh.controller;

import com.kumbh.dto.ProductDto;
import com.kumbh.dto.ShopDto;
import com.kumbh.service.VendorShopService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * REST Controller for Shop Owners (SHOP_OWNER / vendor role).
 * All endpoints require an authenticated user whose JWT is in the jwtToken cookie.
 * Ownership is enforced at the service layer — owners can only mutate their own shops.
 */
@RestController
@RequestMapping("/api/vendor")
public class VendorShopController {

    @Autowired private VendorShopService vendorShopService;

    // ── Auth helper ────────────────────────────────────────────────
    private Integer getUserIdFromContext() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal == null || principal.equals("anonymousUser")) {
            throw new RuntimeException("Unauthorized: missing or invalid token");
        }
        return ((Long) principal).intValue();
    }

    // ─────────────────────────────────────────────────────────────
    // SHOP REGISTRATION & MANAGEMENT
    // ─────────────────────────────────────────────────────────────

    /** POST /api/vendor/shops — Register a new shop (starts in PENDING status) */
    @PostMapping("/shops")
    public ResponseEntity<?> registerShop(@Valid @RequestBody ShopDto dto) {
        try {
            Integer userId = getUserIdFromContext();
            return ResponseEntity.status(HttpStatus.CREATED).body(vendorShopService.registerShop(dto, userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** GET /api/vendor/shops/my — Get the current vendor's shop */
    @GetMapping("/shops/my")
    public ResponseEntity<?> getMyShop() {
        try {
            return ResponseEntity.ok(vendorShopService.getMyShop(getUserIdFromContext()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    /** PUT /api/vendor/shops/{shopId} — Update shop details */
    @PutMapping("/shops/{shopId}")
    public ResponseEntity<?> updateShop(
            @PathVariable Long shopId,
            @Valid @RequestBody ShopDto dto) {
        try {
            return ResponseEntity.ok(vendorShopService.updateShop(shopId, dto, getUserIdFromContext()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** POST /api/vendor/shops/{shopId}/images — Upload shop logo and banner */
    @PostMapping("/shops/{shopId}/images")
    public ResponseEntity<?> uploadImages(
            @PathVariable Long shopId,
            @RequestPart(value = "logo",   required = false) MultipartFile logo,
            @RequestPart(value = "banner", required = false) MultipartFile banner) {
        try {
            return ResponseEntity.ok(vendorShopService.uploadShopImages(shopId, logo, banner, getUserIdFromContext()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** DELETE /api/vendor/shops/{shopId} — Soft-delete (deactivate) own shop */
    @DeleteMapping("/shops/{shopId}")
    public ResponseEntity<?> deleteShop(@PathVariable Long shopId) {
        try {
            vendorShopService.deleteShop(shopId, getUserIdFromContext());
            return ResponseEntity.ok(Map.of("message", "Shop deactivated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────
    // PRODUCT MANAGEMENT (shop-scoped)
    // ─────────────────────────────────────────────────────────────

    /** POST /api/vendor/shops/{shopId}/products — Add product to shop */
    @PostMapping("/shops/{shopId}/products")
    public ResponseEntity<?> addProduct(
            @PathVariable Long shopId,
            @Valid @RequestPart("product") ProductDto dto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(vendorShopService.addProduct(shopId, dto, image, getUserIdFromContext()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** GET /api/vendor/shops/{shopId}/products — List own shop products (paginated) */
    @GetMapping("/shops/{shopId}/products")
    public ResponseEntity<?> getMyProducts(
            @PathVariable Long shopId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        try {
            Page<ProductDto> result = vendorShopService.getMyProducts(shopId, search, category, page, size, getUserIdFromContext());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** PUT /api/vendor/shops/{shopId}/products/{productId} — Update own product */
    @PutMapping("/shops/{shopId}/products/{productId}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long shopId,
            @PathVariable Long productId,
            @Valid @RequestPart("product") ProductDto dto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            return ResponseEntity.ok(vendorShopService.updateProduct(shopId, productId, dto, image, getUserIdFromContext()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** DELETE /api/vendor/shops/{shopId}/products/{productId} — Soft-delete own product */
    @DeleteMapping("/shops/{shopId}/products/{productId}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable Long shopId,
            @PathVariable Long productId) {
        try {
            vendorShopService.deleteProduct(shopId, productId, getUserIdFromContext());
            return ResponseEntity.ok(Map.of("message", "Product removed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────
    // ORDER ANALYTICS (shop-scoped)
    // ─────────────────────────────────────────────────────────────

    /** GET /api/vendor/shops/{shopId}/orders — View orders for own shop */
    @GetMapping("/shops/{shopId}/orders")
    public ResponseEntity<?> getMyOrders(
            @PathVariable Long shopId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        try {
            return ResponseEntity.ok(vendorShopService.getMyOrders(shopId, status, page, size, getUserIdFromContext()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
