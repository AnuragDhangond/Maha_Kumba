package com.kumbh.controller;

import com.kumbh.dto.CartDto;
import com.kumbh.dto.CartRequestDto;
import com.kumbh.dto.CheckoutRequestDto;
import com.kumbh.dto.ShopOrderDto;
import com.kumbh.security.JwtUtil;
import com.kumbh.service.ShopService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserShopController {

    @Autowired
    private ShopService shopService;

    @Autowired
    private JwtUtil jwtUtil;

    private Integer getUserIdFromContext() {
        Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal == null || principal.equals("anonymousUser")) {
            throw new RuntimeException("Unauthorized");
        }
        return ((Long) principal).intValue();
    }

    // --- CART ---
    @GetMapping("/cart")
    public ResponseEntity<?> getCart() {
        try {
            Integer userId = getUserIdFromContext();
            return ResponseEntity.ok(shopService.getCartForUser(userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/cart")
    public ResponseEntity<?> addToCart(@Valid @RequestBody CartRequestDto request) {
        try {
            Integer userId = getUserIdFromContext();
            return ResponseEntity.ok(shopService.addToCart(userId, request));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/cart/{productId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long productId) {
        try {
            Integer userId = getUserIdFromContext();
            return ResponseEntity.ok(shopService.removeFromCart(userId, productId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    // --- CHECKOUT & ORDERS ---
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@Valid @RequestBody CheckoutRequestDto request) {
        try {
            Integer userId = getUserIdFromContext();
            return ResponseEntity.ok(shopService.checkout(userId, request));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders() {
        try {
            Integer userId = getUserIdFromContext();
            return ResponseEntity.ok(shopService.getUserOrders(userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/orders/{orderNumber}/track")
    public ResponseEntity<ShopOrderDto> trackOrder(@PathVariable String orderNumber) {
        // Tracking can be public if you know the exact order number
        try {
            return ResponseEntity.ok(shopService.getOrderByNumber(orderNumber));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // --- PRODUCT SUBMISSION & TRACKING ---
    @GetMapping("/products")
    public ResponseEntity<?> getMyProducts() {
        try {
            Integer userId = getUserIdFromContext();
            return ResponseEntity.ok(shopService.getUserProducts(userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/products")
    public ResponseEntity<?> submitProduct(
            @RequestPart("product") @Valid com.kumbh.dto.ProductDto productDto,
            @RequestPart(value = "thumbnail", required = false) org.springframework.web.multipart.MultipartFile thumbnail,
            @RequestPart(value = "images", required = false) java.util.List<org.springframework.web.multipart.MultipartFile> images) {
        try {
            Integer userId = getUserIdFromContext();
            return ResponseEntity.ok(shopService.submitProduct(productDto, thumbnail, images, userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestPart("product") @Valid com.kumbh.dto.ProductDto productDto,
            @RequestPart(value = "thumbnail", required = false) org.springframework.web.multipart.MultipartFile thumbnail,
            @RequestPart(value = "images", required = false) java.util.List<org.springframework.web.multipart.MultipartFile> images) {
        try {
            Integer userId = getUserIdFromContext();
            return ResponseEntity.ok(shopService.updateSubmittedProduct(id, productDto, thumbnail, images, userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }
}
