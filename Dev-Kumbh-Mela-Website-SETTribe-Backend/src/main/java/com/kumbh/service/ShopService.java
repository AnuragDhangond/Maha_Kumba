package com.kumbh.service;

import com.kumbh.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.List;

public interface ShopService {

    // --- Product Methods ---
    ProductDto createProduct(ProductDto productDto, MultipartFile image);
    ProductDto updateProduct(Long id, ProductDto productDto, MultipartFile image);
    void deleteProduct(Long id);
    List<ProductDto> getAllProducts(boolean onlyActive);
    Page<ProductDto> getAllProducts(String search, String category, Integer minStock, Integer maxStock, Boolean isActive, Integer page, Integer size, String sortBy, String direction);
    Page<ProductDto> getPublicProducts(String query, Long shopId, String category, Integer page, Integer size, String sortBy, String direction);
    List<ProductDto> getProductsByCategory(String category);

    // --- Product Submission & Moderation ---
    ProductDto submitProduct(ProductDto productDto, MultipartFile thumbnail, List<MultipartFile> images, Integer userId);
    ProductDto updateSubmittedProduct(Long id, ProductDto productDto, MultipartFile thumbnail, List<MultipartFile> images, Integer userId);
    List<ProductDto> getUserProducts(Integer userId);
    Page<ProductDto> getPendingProducts(Integer page, Integer size);
    ProductDto moderateProduct(Long id, ModerationRequestDto moderationRequest, Integer operatorId);

    // --- Artisan Methods ---
    ArtisanDto createArtisan(ArtisanDto artisanDto, MultipartFile image);
    ArtisanDto updateArtisan(Long id, ArtisanDto artisanDto, MultipartFile image);
    void deleteArtisan(Long id);
    List<ArtisanDto> getAllArtisans(boolean onlyActive);
    Page<ArtisanDto> getAllArtisans(String search, String craft, String region, Boolean isActive, Integer page, Integer size, String sortBy, String direction);

    // --- Cart Methods ---
    CartDto getCartForUser(Integer userId);
    CartDto addToCart(Integer userId, CartRequestDto request);
    CartDto removeFromCart(Integer userId, Long productId);

    // --- Order / Checkout Methods ---
    ShopOrderDto checkout(Integer userId, CheckoutRequestDto request);
    List<ShopOrderDto> getUserOrders(Integer userId);
    ShopOrderDto getOrderByNumber(String orderNumber);

    // --- Operator Order & Tracking Methods ---
    List<ShopOrderDto> getAllOrders();
    Page<ShopOrderDto> getAllOrders(String search, String customerName, String status, String paymentMethod, LocalDateTime startDate, LocalDateTime endDate, Integer page, Integer size, String sortBy, String direction);
    ShopOrderDto updateTracking(Long orderId, DeliveryTrackingDto trackingDto, String operatorEmail);
    ShopOrderDto updateDeliveryStatus(Long orderId, String deliveryStatus);
}
