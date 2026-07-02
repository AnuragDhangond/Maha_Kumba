package com.kumbh.controller;

import com.kumbh.dto.ProductDto;
import com.kumbh.dto.ShopDto;
import com.kumbh.service.VendorShopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Public REST Controller — no auth required.
 * Exposes geo-discovery, shop listings, shop detail by slug, and product listings.
 * Only ACTIVE + VERIFIED shops are returned.
 */
@RestController
@RequestMapping("/api/public")
public class PublicShopController {

    @Autowired private VendorShopService vendorShopService;

    // ── Legacy ShopService kept for artisans/products (backward compat) ──
    @Autowired private com.kumbh.service.ShopService shopService;

    // ─────────────────────────────────────────────────────────────
    // LEGACY (kept so existing frontend doesn't break)
    // ─────────────────────────────────────────────────────────────

    @GetMapping("/products")
    public ResponseEntity<?> getProducts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        return ResponseEntity.ok(shopService.getPublicProducts(query, null, category, page, size, sortBy, direction));
    }

    @GetMapping("/artisans")
    public ResponseEntity<?> getArtisans() {
        return ResponseEntity.ok(shopService.getAllArtisans(true));
    }

    // ─────────────────────────────────────────────────────────────
    // SHOP DISCOVERY
    // ─────────────────────────────────────────────────────────────

    /**
     * GET /api/public/shops
     * Query params: query, category, page, size
     * Returns paginated list of active verified shops.
     */
    @GetMapping("/shops")
    public ResponseEntity<Page<ShopDto>> getShops(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "16") Integer size) {
        return ResponseEntity.ok(vendorShopService.getPublicShops(query, category, page, size));
    }

    /**
     * GET /api/public/shops/nearby
     * Query params: lat, lng, radius (km, default 5), category, page, size
     * Returns shops sorted by ascending distance using Haversine formula.
     */
    @GetMapping("/shops/nearby")
    public ResponseEntity<Page<ShopDto>> getNearbyShops(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "5.0") double radius,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        return ResponseEntity.ok(vendorShopService.getNearbyShops(lat, lng, radius, category, page, size));
    }

    /**
     * GET /api/public/shops/{slug}
     * Returns full shop detail including opening hours, coordinates, and ratings.
     */
    @GetMapping("/shops/{slug}")
    public ResponseEntity<?> getShopBySlug(@PathVariable String slug) {
        try {
            return ResponseEntity.ok(vendorShopService.getShopBySlug(slug));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/public/shops/{shopId}/products
     * Returns paginated product catalogue for a specific shop.
     */
    @GetMapping("/shops/{shopId}/products")
    public ResponseEntity<Page<ProductDto>> getShopProducts(
            @PathVariable Long shopId,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        return ResponseEntity.ok(vendorShopService.getProductsByShop(shopId, category, page, size));
    }
}
