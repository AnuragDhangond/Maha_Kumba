package com.kumbh.service;

import com.kumbh.dto.ProductDto;
import com.kumbh.dto.ShopDto;
import com.kumbh.dto.ShopOrderDto;
import com.kumbh.dto.ShopVerifyDto;
import com.kumbh.entity.Product;
import com.kumbh.entity.Shop;
import com.kumbh.entity.ShopOrder;
import com.kumbh.repository.ProductRepository;
import com.kumbh.repository.ShopOrderRepository;
import com.kumbh.repository.ShopRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.*;
import java.text.Normalizer;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VendorShopServiceImpl implements VendorShopService {

    private static final Logger log = LoggerFactory.getLogger(VendorShopServiceImpl.class);
    private static final String UPLOAD_DIR = "uploads/";

    @Autowired private ShopRepository shopRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private ShopOrderRepository orderRepository;

    // ─────────────────────────────────────────────────────────────────
    // VENDOR: Shop Registration & Management
    // ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ShopDto registerShop(ShopDto dto, Integer ownerUserId) {
        log.info("Registering shop '{}' for owner userId={}", dto.getShopName(), ownerUserId);

        String slug = generateSlug(dto.getShopName());
        // Ensure slug uniqueness
        if (shopRepository.existsByShopSlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis();
        }

        Shop shop = new Shop();
        mapDtoToEntity(dto, shop);
        shop.setShopSlug(slug);
        shop.setOwnerUserId(ownerUserId);
        shop.setStatus("PENDING");
        shop.setVerificationStatus("PENDING");
        shop.setIsVerified(false);

        Shop saved = shopRepository.save(shop);
        log.info("Shop registered with id={}, slug={}", saved.getId(), saved.getShopSlug());
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public ShopDto updateShop(Long shopId, ShopDto dto, Integer ownerUserId) {
        Shop shop = findShopOwnedBy(shopId, ownerUserId);
        mapDtoToEntity(dto, shop);
        return mapToDto(shopRepository.save(shop));
    }

    @Override
    public ShopDto getMyShop(Integer ownerUserId) {
        List<Shop> shops = shopRepository.findByOwnerUserIdAndIsDeletedFalse(ownerUserId);
        if (shops.isEmpty()) throw new RuntimeException("No shop found for this vendor");
        return mapToDto(shops.get(0));
    }

    @Override
    @Transactional
    public ShopDto uploadShopImages(Long shopId, MultipartFile logo, MultipartFile banner, Integer ownerUserId) {
        Shop shop = findShopOwnedBy(shopId, ownerUserId);
        if (logo != null && !logo.isEmpty()) shop.setLogoImage(saveImage(logo));
        if (banner != null && !banner.isEmpty()) shop.setBannerImage(saveImage(banner));
        return mapToDto(shopRepository.save(shop));
    }

    @Override
    @Transactional
    public void deleteShop(Long shopId, Integer ownerUserId) {
        Shop shop = findShopOwnedBy(shopId, ownerUserId);
        shop.setIsDeleted(true);
        shop.setStatus("BLOCKED");
        shopRepository.save(shop);
        log.info("Shop id={} soft-deleted by owner userId={}", shopId, ownerUserId);
    }

    // ─────────────────────────────────────────────────────────────────
    // VENDOR: Product Management (shop-scoped)
    // ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ProductDto addProduct(Long shopId, ProductDto dto, MultipartFile image, Integer ownerUserId) {
        findShopOwnedBy(shopId, ownerUserId); // ownership guard

        Product product = new Product();
        product.setShopId(shopId);
        mapProductDtoToEntity(dto, product);
        // Products go through moderation — never instant ACTIVE
        product.setStatus("PENDING_APPROVAL");
        product.setIsActive(false);

        if (image != null && !image.isEmpty()) {
            String url = saveImage(image);
            product.setImageUrl(url);
            product.setThumbnail(url);
        }

        Product saved = productRepository.save(product);
        // Update shop product count
        shopRepository.findById(shopId).ifPresent(shop -> {
            shop.setTotalProducts((int) productRepository.countByShopId(shopId));
            shopRepository.save(shop);
        });
        log.info("Product '{}' added to shopId={}", saved.getProductName(), shopId);
        return mapProductToDto(saved);
    }

    @Override
    @Transactional
    public ProductDto updateProduct(Long shopId, Long productId, ProductDto dto, MultipartFile image, Integer ownerUserId) {
        findShopOwnedBy(shopId, ownerUserId);
        Product product = productRepository.findById(productId)
                .filter(p -> shopId.equals(p.getShopId()))
                .orElseThrow(() -> new RuntimeException("Product not found in this shop"));

        mapProductDtoToEntity(dto, product);
        if (image != null && !image.isEmpty()) {
            String url = saveImage(image);
            product.setImageUrl(url);
            product.setThumbnail(url);
        }
        return mapProductToDto(productRepository.save(product));
    }

    @Override
    @Transactional
    public void deleteProduct(Long shopId, Long productId, Integer ownerUserId) {
        findShopOwnedBy(shopId, ownerUserId);
        Product product = productRepository.findById(productId)
                .filter(p -> shopId.equals(p.getShopId()))
                .orElseThrow(() -> new RuntimeException("Product not found in this shop"));
        product.setIsDeleted(true);
        product.setIsActive(false);
        productRepository.save(product);

        shopRepository.findById(shopId).ifPresent(shop -> {
            shop.setTotalProducts((int) productRepository.countByShopId(shopId));
            shopRepository.save(shop);
        });
    }

    @Override
    public Page<ProductDto> getMyProducts(Long shopId, String search, String category,
                                          Integer page, Integer size, Integer ownerUserId) {
        findShopOwnedBy(shopId, ownerUserId);
        Pageable pageable = PageRequest.of(page != null ? page : 0, size != null ? size : 20, Sort.by("createdAt").descending());
        return productRepository.searchPublicProducts(search, shopId, category, pageable)
                .map(this::mapProductToDto);
    }

    @Override
    public Page<ShopOrderDto> getMyOrders(Long shopId, String status, Integer page, Integer size, Integer ownerUserId) {
        findShopOwnedBy(shopId, ownerUserId);
        Pageable pageable = PageRequest.of(page != null ? page : 0, size != null ? size : 20, Sort.by("createdAt").descending());
        return orderRepository.searchOrders(null, status, null, shopId, pageable)
                .map(this::mapOrderToDto);
    }

    // ─────────────────────────────────────────────────────────────────
    // OPERATOR: Verification Workflow
    // ─────────────────────────────────────────────────────────────────

    @Override
    public Page<ShopDto> getAllShops(String query, String status, String verificationStatus,
                                    Integer page, Integer size, String sortBy, String direction) {
        Sort sort = "desc".equalsIgnoreCase(direction)
                ? Sort.by(sortBy != null ? sortBy : "createdAt").descending()
                : Sort.by(sortBy != null ? sortBy : "createdAt").ascending();
        Pageable pageable = PageRequest.of(page != null ? page : 0, size != null ? size : 20, sort);
        return shopRepository.searchShops(query, status, verificationStatus, pageable)
                .map(this::mapToDto);
    }

    @Override
    public ShopDto getShopById(Long shopId) {
        return mapToDto(shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found: " + shopId)));
    }

    @Override
    @Transactional
    public ShopDto verifyShop(Long shopId, ShopVerifyDto dto, String operatorEmail) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found: " + shopId));

        String decision = dto.getDecision().toUpperCase();
        switch (decision) {
            case "APPROVED":
                shop.setVerificationStatus("APPROVED");
                shop.setIsVerified(true);
                shop.setStatus("ACTIVE");
                break;
            case "REJECTED":
                shop.setVerificationStatus("REJECTED");
                shop.setIsVerified(false);
                shop.setStatus("BLOCKED");
                break;
            default:
                throw new RuntimeException("Invalid decision: " + dto.getDecision() + ". Use APPROVED or REJECTED.");
        }

        if (dto.getRemarks() != null) shop.setVerificationRemarks(dto.getRemarks());
        log.info("Shop id={} {} by operator={}", shopId, decision, operatorEmail);
        return mapToDto(shopRepository.save(shop));
    }

    @Override
    @Transactional
    public ShopDto suspendShop(Long shopId, String reason, String operatorEmail) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found: " + shopId));
        shop.setStatus("BLOCKED");
        shop.setVerificationRemarks("Suspended: " + reason);
        log.warn("Shop id={} suspended by operator={}, reason={}", shopId, operatorEmail, reason);
        return mapToDto(shopRepository.save(shop));
    }

    @Override
    @Transactional
    public ShopDto reactivateShop(Long shopId, String operatorEmail) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found: " + shopId));
        if (!Boolean.TRUE.equals(shop.getIsVerified())) {
            throw new RuntimeException("Shop must be verified before reactivation");
        }
        shop.setStatus("ACTIVE");
        shop.setVerificationRemarks(null);
        log.info("Shop id={} reactivated by operator={}", shopId, operatorEmail);
        return mapToDto(shopRepository.save(shop));
    }

    // ─────────────────────────────────────────────────────────────────
    // PUBLIC: Discovery
    // ─────────────────────────────────────────────────────────────────

    @Override
    public Page<ShopDto> getPublicShops(String query, String category, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page != null ? page : 0, size != null ? size : 16,
                Sort.by("rating").descending());
        return shopRepository.findPublicShops(query, category, pageable).map(this::mapToDto);
    }

    @Override
    public ShopDto getShopBySlug(String slug) {
        return mapToDto(shopRepository.findByShopSlugAndIsDeletedFalse(slug)
                .orElseThrow(() -> new RuntimeException("Shop not found: " + slug)));
    }

    @Override
    public Page<ShopDto> getNearbyShops(double lat, double lng, double radiusKm,
                                        String category, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page != null ? page : 0, size != null ? size : 20);
        return shopRepository.findNearbyShops(lat, lng, radiusKm,
                        (category != null && !category.isBlank()) ? category : null, pageable)
                .map(this::mapToDto);
    }

    @Override
    public Page<ProductDto> getProductsByShop(Long shopId, String category, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page != null ? page : 0, size != null ? size : 20,
                Sort.by("createdAt").descending());
        return productRepository.searchPublicProducts(null, shopId, category, pageable)
                .map(this::mapProductToDto);
    }

    // ─────────────────────────────────────────────────────────────────
    // OPERATOR: Analytics
    // ─────────────────────────────────────────────────────────────────

    @Override
    public ShopAnalyticsDto getShopAnalytics() {
        ShopAnalyticsDto stats = new ShopAnalyticsDto();
        stats.totalShops          = shopRepository.countTotal();
        stats.pendingVerification = shopRepository.countPendingVerification();
        stats.activeVerifiedShops = shopRepository.countActiveVerified();
        stats.pendingOrders       = orderRepository.countPendingOrders();
        stats.totalRevenue        = orderRepository.sumTotalRevenue();
        return stats;
    }

    // ─────────────────────────────────────────────────────────────────
    // Private Helpers
    // ─────────────────────────────────────────────────────────────────

    private Shop findShopOwnedBy(Long shopId, Integer ownerUserId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found: " + shopId));
        if (!ownerUserId.equals(shop.getOwnerUserId())) {
            throw new RuntimeException("Access denied: you do not own this shop");
        }
        if (Boolean.TRUE.equals(shop.getIsDeleted())) {
            throw new RuntimeException("Shop has been deleted");
        }
        return shop;
    }

    private String generateSlug(String shopName) {
        String normalized = Normalizer.normalize(shopName, Normalizer.Form.NFD)
                .replaceAll("[^\\p{ASCII}]", "");
        return normalized.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-");
    }

    private String saveImage(MultipartFile image) {
        String original = image.getOriginalFilename();
        if (original != null) {
            String lower = original.toLowerCase();
            if (!(lower.endsWith(".jpg") || lower.endsWith(".jpeg")
                    || lower.endsWith(".png") || lower.endsWith(".webp"))) {
                throw new RuntimeException("Invalid format. Allowed: JPG, PNG, WebP");
            }
        }
        try {
            String filename = UUID.randomUUID() + "_" + original;
            Path path = Paths.get(UPLOAD_DIR + filename);
            Files.createDirectories(path.getParent());
            Files.copy(image.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store image", e);
        }
    }

    // ── DTO Mappers ───────────────────────────────────────────────────

    private void mapDtoToEntity(ShopDto dto, Shop shop) {
        if (dto.getShopName()        != null) shop.setShopName(dto.getShopName());
        if (dto.getOwnerName()       != null) shop.setOwnerName(dto.getOwnerName());
        if (dto.getEmail()           != null) shop.setEmail(dto.getEmail());
        if (dto.getPhone()           != null) shop.setPhone(dto.getPhone());
        if (dto.getWhatsappNumber()  != null) shop.setWhatsappNumber(dto.getWhatsappNumber());
        if (dto.getDescription()     != null) shop.setDescription(dto.getDescription());
        if (dto.getCategory()        != null) shop.setCategory(dto.getCategory());
        if (dto.getSubCategory()     != null) shop.setSubCategory(dto.getSubCategory());
        if (dto.getAddress()         != null) shop.setAddress(dto.getAddress());
        if (dto.getCity()            != null) shop.setCity(dto.getCity());
        if (dto.getState()           != null) shop.setState(dto.getState());
        if (dto.getPincode()         != null) shop.setPincode(dto.getPincode());
        if (dto.getLatitude()        != null) shop.setLatitude(dto.getLatitude());
        if (dto.getLongitude()       != null) shop.setLongitude(dto.getLongitude());
        if (dto.getGoogleMapLink()   != null) shop.setGoogleMapLink(dto.getGoogleMapLink());
        if (dto.getLandmark()        != null) shop.setLandmark(dto.getLandmark());
        if (dto.getOpeningTime()     != null) shop.setOpeningTime(dto.getOpeningTime());
        if (dto.getClosingTime()     != null) shop.setClosingTime(dto.getClosingTime());
    }

    private ShopDto mapToDto(Shop s) {
        ShopDto dto = new ShopDto();
        dto.setId(s.getId());
        dto.setShopName(s.getShopName());
        dto.setShopSlug(s.getShopSlug());
        dto.setOwnerName(s.getOwnerName());
        dto.setOwnerUserId(s.getOwnerUserId());
        dto.setEmail(s.getEmail());
        dto.setPhone(s.getPhone());
        dto.setWhatsappNumber(s.getWhatsappNumber());
        dto.setDescription(s.getDescription());
        dto.setCategory(s.getCategory());
        dto.setSubCategory(s.getSubCategory());
        dto.setLogoImage(s.getLogoImage());
        dto.setBannerImage(s.getBannerImage());
        dto.setAddress(s.getAddress());
        dto.setCity(s.getCity());
        dto.setState(s.getState());
        dto.setPincode(s.getPincode());
        dto.setLatitude(s.getLatitude());
        dto.setLongitude(s.getLongitude());
        dto.setGoogleMapLink(s.getGoogleMapLink());
        dto.setLandmark(s.getLandmark());
        dto.setOpeningTime(s.getOpeningTime());
        dto.setClosingTime(s.getClosingTime());
        dto.setIsVerified(s.getIsVerified());
        dto.setVerificationStatus(s.getVerificationStatus());
        dto.setVerificationRemarks(s.getVerificationRemarks());
        dto.setStatus(s.getStatus());
        dto.setRating(s.getRating());
        dto.setTotalOrders(s.getTotalOrders());
        dto.setTotalProducts(s.getTotalProducts());
        dto.setTotalRevenue(s.getTotalRevenue());
        dto.setCreatedAt(s.getCreatedAt());
        dto.setUpdatedAt(s.getUpdatedAt());
        return dto;
    }

    private void mapProductDtoToEntity(ProductDto dto, Product p) {
        if (dto.getProductName()     != null) p.setProductName(dto.getProductName());
        if (dto.getDescription()     != null) p.setDescription(dto.getDescription());
        if (dto.getPrice()           != null) p.setPrice(dto.getPrice());
        if (dto.getDiscountedPrice() != null) p.setDiscountedPrice(dto.getDiscountedPrice());
        if (dto.getStockQuantity()   != null) p.setStockQuantity(dto.getStockQuantity());
        if (dto.getCategory()        != null) p.setCategory(dto.getCategory());
        if (dto.getTags()            != null) p.setTags(dto.getTags());
        if (dto.getStatus()          != null) p.setStatus(dto.getStatus());
        if (dto.getIsFeatured()      != null) p.setIsFeatured(dto.getIsFeatured());
        if (dto.getIsActive()        != null) p.setIsActive(dto.getIsActive());
        if (dto.getWeight()          != null) p.setWeight(dto.getWeight());
        if (dto.getDimensions()      != null) p.setDimensions(dto.getDimensions());
        if (dto.getDeliveryAvailable() != null) p.setDeliveryAvailable(dto.getDeliveryAvailable());
        if (dto.getVisibleInMarketplace() != null) p.setVisibleInMarketplace(dto.getVisibleInMarketplace());
        if (dto.getImages()          != null) p.setImages(dto.getImages());
        if (dto.getThumbnail()       != null) p.setThumbnail(dto.getThumbnail());
        if (dto.getImageUrl()        != null) p.setImageUrl(dto.getImageUrl());
    }

    ProductDto mapProductToDto(Product p) {
        ProductDto dto = new ProductDto();
        dto.setId(p.getId());
        dto.setShopId(p.getShopId());
        dto.setProductName(p.getProductName());
        dto.setDescription(p.getDescription());
        dto.setPrice(p.getPrice());
        dto.setDiscountedPrice(p.getDiscountedPrice());
        dto.setStockQuantity(p.getStockQuantity());
        dto.setCategory(p.getCategory());
        dto.setImages(p.getImages());
        dto.setThumbnail(p.getThumbnail());
        dto.setImageUrl(p.getImageUrl() != null ? p.getImageUrl() : p.getThumbnail());
        dto.setTags(p.getTags());
        dto.setRating(p.getRating());
        dto.setStatus(p.getStatus());
        dto.setIsFeatured(p.getIsFeatured());
        dto.setIsActive(p.getIsActive());
        dto.setWeight(p.getWeight());
        dto.setDimensions(p.getDimensions());
        dto.setDeliveryAvailable(p.getDeliveryAvailable());
        dto.setVisibleInMarketplace(p.getVisibleInMarketplace());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }

    private ShopOrderDto mapOrderToDto(ShopOrder o) {
        ShopOrderDto dto = new ShopOrderDto();
        dto.setId(o.getId());
        dto.setOrderNumber(o.getOrderNumber());
        dto.setUserId(o.getUserId());
        dto.setShopId(o.getShopId());
        dto.setVendorId(o.getVendorId());
        dto.setTotalAmount(o.getTotalAmount());
        dto.setTaxAmount(o.getTaxAmount());
        dto.setDeliveryCharge(o.getDeliveryCharge());
        dto.setDiscountAmount(o.getDiscountAmount());
        dto.setGrandTotal(o.getGrandTotal());
        dto.setPaymentMethod(o.getPaymentMethod());
        dto.setPaymentStatus(o.getPaymentStatus());
        dto.setOrderStatus(o.getOrderStatus());
        dto.setDeliveryStatus(o.getDeliveryStatus());
        dto.setCustomerName(o.getCustomerName());
        dto.setPhone(o.getPhone());
        dto.setAddress(o.getAddress());
        dto.setVendorPayoutStatus(o.getVendorPayoutStatus());
        dto.setVendorPayoutAmount(o.getVendorPayoutAmount());
        dto.setRefundRemarks(o.getRefundRemarks());
        dto.setCreatedAt(o.getCreatedAt());
        dto.setUpdatedAt(o.getUpdatedAt());
        return dto;
    }
}
