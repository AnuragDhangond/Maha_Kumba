package com.kumbh.controller;

import com.kumbh.dto.*;
import com.kumbh.entity.User;
import com.kumbh.service.ShopService;
import com.kumbh.service.UserService;
import com.kumbh.service.VendorShopService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Operator REST Controller — secured to OPERATOR and ADMIN roles via SecurityConfig.
 * Extends legacy product/artisan/order management with the new shop verification workflow.
 */
@RestController
@RequestMapping("/api/operator")
public class OperatorShopController {

    @Autowired private ShopService shopService;
    @Autowired private VendorShopService vendorShopService;
    @Autowired private UserService userService;

    // ─────────────────────────────────────────────────────────────
    // SHOP VERIFICATION WORKFLOW (new)
    // ─────────────────────────────────────────────────────────────

    /** GET /api/operator/shops — Paginated, filterable list of all shops */
    @GetMapping("/shops")
    public ResponseEntity<Page<ShopDto>> getAllShops(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String verificationStatus,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        return ResponseEntity.ok(vendorShopService.getAllShops(query, status, verificationStatus, page, size, sortBy, direction));
    }

    /** GET /api/operator/shops/{shopId} — Full shop detail for review */
    @GetMapping("/shops/{shopId}")
    public ResponseEntity<?> getShopById(@PathVariable Long shopId) {
        try {
            return ResponseEntity.ok(vendorShopService.getShopById(shopId));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /api/operator/shops/{shopId}/verify
     * Body: { "decision": "APPROVED" | "REJECTED", "remarks": "..." }
     * Transitions shop through the verification state machine.
     */
    @PostMapping("/shops/{shopId}/verify")
    public ResponseEntity<?> verifyShop(
            @PathVariable Long shopId,
            @Valid @RequestBody ShopVerifyDto dto,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(vendorShopService.verifyShop(shopId, dto, resolveOperatorIdentity(authentication)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** POST /api/operator/shops/{shopId}/suspend — Suspend an active shop */
    @PostMapping("/shops/{shopId}/suspend")
    public ResponseEntity<?> suspendShop(
            @PathVariable Long shopId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        try {
            String reason = body.getOrDefault("reason", "Policy violation");
            return ResponseEntity.ok(vendorShopService.suspendShop(shopId, reason, resolveOperatorIdentity(authentication)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** POST /api/operator/shops/{shopId}/reactivate — Reactivate a suspended shop */
    @PostMapping("/shops/{shopId}/reactivate")
    public ResponseEntity<?> reactivateShop(
            @PathVariable Long shopId,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(vendorShopService.reactivateShop(shopId, resolveOperatorIdentity(authentication)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** GET /api/operator/shops/analytics — Marketplace dashboard metrics */
    @GetMapping("/shops/analytics")
    public ResponseEntity<?> getShopAnalytics() {
        return ResponseEntity.ok(vendorShopService.getShopAnalytics());
    }

    // ─────────────────────────────────────────────────────────────
    // LEGACY: PRODUCTS (kept intact)
    // ─────────────────────────────────────────────────────────────

    @PostMapping("/products")
    public ResponseEntity<ProductDto> createProduct(
            @Valid @RequestPart("product") ProductDto dto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(shopService.createProduct(dto, image));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductDto> updateProduct(
            @PathVariable Long id,
            @Valid @RequestPart("product") ProductDto dto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(shopService.updateProduct(id, dto, image));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        shopService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/products")
    public ResponseEntity<Page<ProductDto>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer minStock,
            @RequestParam(required = false) Integer maxStock,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        return ResponseEntity.ok(shopService.getAllProducts(search, category, minStock, maxStock, isActive, page, size, sortBy, direction));
    }

    // ─────────────────────────────────────────────────────────────
    // LEGACY: ARTISANS (kept intact)
    // ─────────────────────────────────────────────────────────────

    @PostMapping("/artisans")
    public ResponseEntity<ArtisanDto> createArtisan(
            @Valid @RequestPart("artisan") ArtisanDto dto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(shopService.createArtisan(dto, image));
    }

    @PutMapping("/artisans/{id}")
    public ResponseEntity<ArtisanDto> updateArtisan(
            @PathVariable Long id,
            @Valid @RequestPart("artisan") ArtisanDto dto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(shopService.updateArtisan(id, dto, image));
    }

    @DeleteMapping("/artisans/{id}")
    public ResponseEntity<Void> deleteArtisan(@PathVariable Long id) {
        shopService.deleteArtisan(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/artisans")
    public ResponseEntity<Page<ArtisanDto>> getAllArtisans(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String craft,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        return ResponseEntity.ok(shopService.getAllArtisans(search, craft, region, isActive, page, size, sortBy, direction));
    }

    // ─────────────────────────────────────────────────────────────
    // LEGACY: ORDERS (kept intact)
    // ─────────────────────────────────────────────────────────────

    @GetMapping("/orders")
    public ResponseEntity<Page<ShopOrderDto>> getAllOrders(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        return ResponseEntity.ok(shopService.getAllOrders(search, customerName, status, paymentMethod, startDate, endDate, page, size, sortBy, direction));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ShopOrderDto> getOrderById(@PathVariable Long id) {
        return shopService.getAllOrders().stream()
                .filter(o -> o.getId().equals(id)).findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/orders/{id}/tracking")
    public ResponseEntity<ShopOrderDto> updateTracking(
            @PathVariable Long id,
            @Valid @RequestBody DeliveryTrackingDto dto,
            Authentication authentication) {
        return ResponseEntity.ok(shopService.updateTracking(id, dto, resolveOperatorIdentity(authentication)));
    }

    @PutMapping("/orders/{id}/delivery")
    public ResponseEntity<ShopOrderDto> updateDelivery(
            @PathVariable Long id,
            @Valid @RequestBody DeliveryTrackingDto dto) {
        return ResponseEntity.ok(shopService.updateDeliveryStatus(id, dto.getCurrentStatus()));
    }

    // ─────────────────────────────────────────────────────────────
    // PRODUCT MODERATION QUEUE (new)
    // ─────────────────────────────────────────────────────────────

    /** GET /api/operator/products/queue — all products pending approval */
    @GetMapping("/products/queue")
    public ResponseEntity<Page<ProductDto>> getProductQueue(
            @RequestParam(defaultValue = "0")  Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        return ResponseEntity.ok(shopService.getPendingProducts(page, size));
    }

    /** POST /api/operator/products/{id}/moderate — approve/reject a pending product */
    @PostMapping("/products/{id}/moderate")
    public ResponseEntity<?> moderateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ModerationRequestDto request,
            Authentication authentication) {
        try {
            // resolveOperatorIdentity returns email, but service needs Integer operatorId (userId)
            // Let's get userId from authentication principal if it's a Long
            Integer operatorId = 1; // Default
            if (authentication != null && authentication.getPrincipal() instanceof Long) {
                operatorId = ((Long) authentication.getPrincipal()).intValue();
            }
            return ResponseEntity.ok(shopService.moderateProduct(id, request, operatorId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** GET /api/operator/products/queue/count — badge count for sidebar */
    @GetMapping("/products/queue/count")
    public ResponseEntity<?> getPendingProductCount() {
        return ResponseEntity.ok(java.util.Map.of("count", shopService.getPendingProducts(0, 1).getTotalElements()));
    }

    // ── Vendor Application Queue (delegates to VendorApplicationService) ──

    @Autowired private com.kumbh.service.VendorApplicationService vendorApplicationService;

    /** GET /api/operator/vendor-queue */
    @GetMapping("/vendor-queue")
    public ResponseEntity<?> getVendorQueue(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0")  Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        return ResponseEntity.ok(
                vendorApplicationService.searchApplications(query, status, page, size, "createdAt", "desc"));
    }

    /** PATCH /api/operator/vendors/{id}/approve — shorthand approve */
    @PatchMapping("/vendors/{id}/approve")
    public ResponseEntity<?> approveVendor(@PathVariable Long id, Authentication auth) {
        try {
            return ResponseEntity.ok(vendorApplicationService.reviewApplication(
                    id, "APPROVED", "Application reviewed and approved.", resolveOperatorIdentity(auth)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    /** PATCH /api/operator/vendors/{id}/reject — shorthand reject */
    @PatchMapping("/vendors/{id}/reject")
    public ResponseEntity<?> rejectVendor(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body,
            Authentication auth) {
        try {
            String remarks = body.getOrDefault("remarks", "Application did not meet requirements.");
            return ResponseEntity.ok(vendorApplicationService.reviewApplication(
                    id, "REJECTED", remarks, resolveOperatorIdentity(auth)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────

    private String resolveOperatorIdentity(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof Long) {
            Long userId = (Long) auth.getPrincipal();
            return userService.getAllUsersList().stream()
                    .filter(u -> Long.valueOf(u.getId()).equals(userId))
                    .findFirst()
                    .map(u -> u.getEmail() != null ? u.getEmail() : u.getName())
                    .orElse("operator@mahakumbh.in");
        }
        return "operator@mahakumbh.in";
    }
}

