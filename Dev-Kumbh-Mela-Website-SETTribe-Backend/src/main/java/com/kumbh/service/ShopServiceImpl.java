package com.kumbh.service;

import com.kumbh.dto.*;
import com.kumbh.entity.*;
import com.kumbh.repository.*;
import com.kumbh.pagination.ArtisanPagination;
import com.kumbh.pagination.OrderPagination;
import com.kumbh.pagination.ProductPagination;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ShopServiceImpl implements ShopService {

    private final ProductRepository productRepository;
    private final ArtisanRepository artisanRepository;
    private final ShopOrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final DeliveryTrackingRepository trackingRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;

    @Autowired
    private ProductPagination productPagination;

    @Autowired
    private ArtisanPagination artisanPagination;

    @Autowired
    private OrderPagination orderPagination;

    private final String UPLOAD_DIR = "uploads/";

    @Autowired
    public ShopServiceImpl(ProductRepository productRepository, ArtisanRepository artisanRepository,
                           ShopOrderRepository orderRepository, OrderItemRepository orderItemRepository,
                           DeliveryTrackingRepository trackingRepository,
                           CartItemRepository cartItemRepository, UserRepository userRepository) {
        this.productRepository = productRepository;
        this.artisanRepository = artisanRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.trackingRepository = trackingRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
    }

    private String saveImage(MultipartFile image) {
        if (image == null || image.isEmpty()) return null;
        
        String originalFilename = image.getOriginalFilename();
        if (originalFilename != null) {
            String lower = originalFilename.toLowerCase();
            if (!(lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".webp"))) {
                throw new RuntimeException("Invalid file format. Only JPG, PNG, and WebP are allowed.");
            }
        }

        try {
            String filename = UUID.randomUUID().toString() + "_" + originalFilename;
            Path path = Paths.get(UPLOAD_DIR + filename);
            Files.createDirectories(path.getParent());
            Files.copy(image.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store image", e);
        }
    }

    // --- Product Methods ---
    @Override
    public ProductDto createProduct(ProductDto dto, MultipartFile image) {
        Product product = new Product();
        product.setProductName(dto.getProductName());
        product.setCategory(dto.getCategory());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        product.setVisibleInMarketplace(dto.getVisibleInMarketplace() != null ? dto.getVisibleInMarketplace() : true);
        
        // Auto-approve products created directly by the Operator
        product.setModerationStatus("APPROVED");
        product.setStatus(product.getIsActive() ? "ACTIVE" : "INACTIVE");

        if (image != null) {
            product.setImageUrl(saveImage(image));
        } else {
            product.setImageUrl(dto.getImageUrl());
        }

        Product saved = productRepository.save(product);
        return mapToDto(saved);
    }

    @Override
    public ProductDto updateProduct(Long id, ProductDto dto, MultipartFile image) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        if(dto.getProductName() != null) product.setProductName(dto.getProductName());
        if(dto.getCategory() != null) product.setCategory(dto.getCategory());
        if(dto.getDescription() != null) product.setDescription(dto.getDescription());
        if(dto.getPrice() != null) product.setPrice(dto.getPrice());
        if(dto.getStockQuantity() != null) product.setStockQuantity(dto.getStockQuantity());
        if(dto.getIsActive() != null) product.setIsActive(dto.getIsActive());
        if(dto.getVisibleInMarketplace() != null) product.setVisibleInMarketplace(dto.getVisibleInMarketplace());

        if (image != null && !image.isEmpty()) {
            product.setImageUrl(saveImage(image));
        }
        return mapToDto(productRepository.save(product));
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        product.setIsDeleted(true);
        product.setIsActive(false);
        productRepository.save(product);
    }

    @Override
    public List<ProductDto> getAllProducts(boolean onlyActive) {
        List<Product> products = onlyActive ? productRepository.findByIsActiveTrueAndIsDeletedFalse() : productRepository.findByIsDeletedFalse();
        return products.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public Page<ProductDto> getAllProducts(String search, String category, Integer minStock, Integer maxStock, Boolean isActive, Integer page, Integer size, String sortBy, String direction) {
        return productPagination.getPaginatedProducts(search, page, size, sortBy, direction);
    }

    @Override
    public Page<ProductDto> getPublicProducts(String query, Long shopId, String category, Integer page, Integer size, String sortBy, String direction) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(direction), sortBy));
        return productRepository.searchPublicProducts(query, shopId, category, pageable).map(this::mapToDto);
    }

    @Override
    public List<ProductDto> getProductsByCategory(String category) {
        return productRepository.findByCategoryAndIsActiveTrueAndIsDeletedFalse(category).stream()
                .filter(p -> "APPROVED".equals(p.getModerationStatus()) && Boolean.TRUE.equals(p.getVisibleInMarketplace()))
                .map(this::mapToDto).collect(Collectors.toList());
    }

    // --- Product Submission & Moderation ---
    @Override
    @Transactional
    public ProductDto submitProduct(ProductDto dto, MultipartFile thumbnail, List<MultipartFile> images, Integer userId) {
        Product product = new Product();
        product.setProductName(dto.getProductName());
        product.setCategory(dto.getCategory());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setDiscountedPrice(dto.getDiscountedPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setTags(dto.getTags());
        product.setWeight(dto.getWeight());
        product.setDimensions(dto.getDimensions());
        product.setDeliveryAvailable(dto.getDeliveryAvailable() != null ? dto.getDeliveryAvailable() : true);
        product.setVisibleInMarketplace(dto.getVisibleInMarketplace() != null ? dto.getVisibleInMarketplace() : true);
        
        product.setSubmittedByUserId(userId);
        product.setModerationStatus("PENDING");
        product.setIsActive(false); // Requires operator approval
        product.setStatus("DRAFT"); // Initial internal status

        // Seller Info
        product.setSellerName(dto.getSellerName());
        product.setSellerEmail(dto.getSellerEmail());
        product.setSellerPhone(dto.getSellerPhone());
        product.setWhatsappNumber(dto.getWhatsappNumber());
        product.setPickupLocation(dto.getPickupLocation());
        product.setSellerCity(dto.getSellerCity());
        product.setSellerAddress(dto.getSellerAddress());

        if (thumbnail != null && !thumbnail.isEmpty()) {
            product.setThumbnail(saveImage(thumbnail));
            product.setImageUrl(product.getThumbnail()); // Legacy field
        }

        if (images != null && !images.isEmpty()) {
            List<String> imageUrls = images.stream()
                    .map(this::saveImage)
                    .filter(url -> url != null)
                    .collect(Collectors.toList());
            product.setImages(String.join(",", imageUrls));
        }

        Product saved = productRepository.save(product);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public ProductDto updateSubmittedProduct(Long id, ProductDto dto, MultipartFile thumbnail, List<MultipartFile> images, Integer userId) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (!userId.equals(product.getSubmittedByUserId())) {
            throw new RuntimeException("Unauthorized to update this product");
        }

        product.setProductName(dto.getProductName());
        product.setCategory(dto.getCategory());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setDiscountedPrice(dto.getDiscountedPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setTags(dto.getTags());
        product.setWeight(dto.getWeight());
        product.setDimensions(dto.getDimensions());
        product.setDeliveryAvailable(dto.getDeliveryAvailable() != null ? dto.getDeliveryAvailable() : true);
        product.setVisibleInMarketplace(dto.getVisibleInMarketplace() != null ? dto.getVisibleInMarketplace() : true);
        
        // Reset moderation status upon update
        product.setModerationStatus("PENDING");
        product.setIsActive(false);

        // Seller Info
        product.setSellerName(dto.getSellerName());
        product.setSellerEmail(dto.getSellerEmail());
        product.setSellerPhone(dto.getSellerPhone());
        product.setWhatsappNumber(dto.getWhatsappNumber());
        product.setPickupLocation(dto.getPickupLocation());
        product.setSellerCity(dto.getSellerCity());
        product.setSellerAddress(dto.getSellerAddress());

        if (thumbnail != null && !thumbnail.isEmpty()) {
            product.setThumbnail(saveImage(thumbnail));
            product.setImageUrl(product.getThumbnail());
        }

        if (images != null && !images.isEmpty()) {
            List<String> imageUrls = images.stream()
                    .map(this::saveImage)
                    .filter(url -> url != null)
                    .collect(Collectors.toList());
            product.setImages(String.join(",", imageUrls));
        }

        return mapToDto(productRepository.save(product));
    }

    @Override
    public List<ProductDto> getUserProducts(Integer userId) {
        return productRepository.findBySubmittedByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public Page<ProductDto> getPendingProducts(Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findPendingApproval(pageable).map(this::mapToDto);
    }

    @Override
    @Transactional
    public ProductDto moderateProduct(Long id, ModerationRequestDto request, Integer operatorId) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        
        String status = request.getStatus();
        product.setModerationStatus(status);
        product.setModerationRemarks(request.getRemarks());
        product.setApprovedBy(operatorId);
        product.setApprovedAt(LocalDateTime.now());
        
        if ("APPROVED".equals(status)) {
            product.setIsActive(true);
            product.setStatus("ACTIVE");
        } else if ("REJECTED".equals(status) || "BLOCKED".equals(status)) {
            product.setIsActive(false);
            product.setStatus("SUSPENDED");
            product.setRejectionReason(request.getRejectionReason());
        } else if ("CHANGES_REQUESTED".equals(status)) {
            product.setIsActive(false);
            product.setStatus("DRAFT");
            product.setModerationRemarks(request.getRemarks());
        } else if ("UNDER_REVIEW".equals(status)) {
            product.setIsActive(false);
            product.setStatus("DRAFT");
        }

        return mapToDto(productRepository.save(product));
    }

    // --- Artisan Methods ---
    @Override
    public ArtisanDto createArtisan(ArtisanDto dto, MultipartFile image) {
        Artisan artisan = new Artisan();
        artisan.setArtisanName(dto.getArtisanName());
        artisan.setCraft(dto.getCraft());
        artisan.setRegion(dto.getRegion());
        artisan.setDescription(dto.getDescription());
        artisan.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        if (image != null) {
            artisan.setImageUrl(saveImage(image));
        } else {
            artisan.setImageUrl(dto.getImageUrl());
        }

        return mapToDto(artisanRepository.save(artisan));
    }

    @Override
    public ArtisanDto updateArtisan(Long id, ArtisanDto dto, MultipartFile image) {
        Artisan artisan = artisanRepository.findById(id).orElseThrow(() -> new RuntimeException("Artisan not found"));
        if(dto.getArtisanName() != null) artisan.setArtisanName(dto.getArtisanName());
        if(dto.getCraft() != null) artisan.setCraft(dto.getCraft());
        if(dto.getRegion() != null) artisan.setRegion(dto.getRegion());
        if(dto.getDescription() != null) artisan.setDescription(dto.getDescription());
        if(dto.getIsActive() != null) artisan.setIsActive(dto.getIsActive());

        if (image != null && !image.isEmpty()) {
            artisan.setImageUrl(saveImage(image));
        }
        return mapToDto(artisanRepository.save(artisan));
    }

    @Override
    public void deleteArtisan(Long id) {
        artisanRepository.deleteById(id);
    }

    @Override
    public List<ArtisanDto> getAllArtisans(boolean onlyActive) {
        List<Artisan> artisans = onlyActive ? artisanRepository.findByIsActiveTrue() : artisanRepository.findAll();
        return artisans.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public Page<ArtisanDto> getAllArtisans(String search, String craft, String region, Boolean isActive, Integer page, Integer size, String sortBy, String direction) {
        return artisanPagination.getPaginatedArtisans(search, page, size, sortBy, direction);
    }

    // --- Cart Methods ---
    @Override
    public CartDto getCartForUser(Integer userId) {
        return mapToCartDto(userId);
    }

    @Override
    @Transactional
    public CartDto addToCart(Integer userId, CartRequestDto request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        Optional<CartItem> existingItem = cartItems.stream()
                .filter(item -> item.getProductId().equals(product.getId()))
                .findFirst();

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(existingItem.get().getQuantity() + request.getQuantity());
            cartItemRepository.save(existingItem.get());
        } else {
            CartItem item = new CartItem();
            item.setUserId(userId);
            item.setProductId(product.getId());
            item.setQuantity(request.getQuantity());
            cartItemRepository.save(item);
        }

        return mapToCartDto(userId);
    }

    @Override
    @Transactional
    public CartDto removeFromCart(Integer userId, Long productId) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        cartItems.stream()
                .filter(item -> item.getProductId().equals(productId))
                .forEach(cartItemRepository::delete);
        return mapToCartDto(userId);
    }

    // --- Order / Checkout Methods ---
    @Override
    @Transactional
    public ShopOrderDto checkout(Integer userId, CheckoutRequestDto request) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        ShopOrder order = new ShopOrder();
        order.setUserId(userId);
        order.setOrderNumber("KMB-" + System.currentTimeMillis() + "-" + userId);
        order.setAddress(request.getAddress());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setCustomerName(request.getCustomerName());
        order.setOrderStatus("Ordered");
        order.setDeliveryStatus("Ordered");

        ShopOrder savedOrder = orderRepository.save(order);

        java.math.BigDecimal total = java.math.BigDecimal.ZERO;
        for (CartItem cItem : cartItems) {
            Product p = productRepository.findById(cItem.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            OrderItem oItem = new OrderItem();
            oItem.setShopOrderId(savedOrder.getId());
            oItem.setProductId(p.getId());
            oItem.setQuantity(cItem.getQuantity());
            oItem.setPrice(p.getPrice());
            orderItemRepository.save(oItem);
            
            // Deduct stock
            if (p.getStockQuantity() < cItem.getQuantity()) {
                throw new RuntimeException("Not enough stock for product: " + p.getProductName());
            }
            p.setStockQuantity(p.getStockQuantity() - cItem.getQuantity());
            productRepository.save(p);

            total = total.add(p.getPrice().multiply(new java.math.BigDecimal(cItem.getQuantity())));
        }
        savedOrder.setTotalAmount(total);
        savedOrder.setGrandTotal(total);
        orderRepository.save(savedOrder);

        // Add tracking entry
        DeliveryTracking tracking = new DeliveryTracking();
        tracking.setShopOrderId(savedOrder.getId());
        tracking.setCurrentStatus("Ordered");
        tracking.setCurrentLocation("Fulfillment Hub");
        tracking.setCourierPartner("Mahakumbh Logistics");
        tracking.setTrackingNumber(savedOrder.getOrderNumber());
        tracking.setLatestUpdate("Order confirmed and queued at Fulfillment Hub.");
        tracking.setExpectedDeliveryDate(LocalDateTime.now().plusDays(5));
        trackingRepository.save(tracking);

        // Clear cart
        cartItemRepository.deleteByUserId(userId);

        return mapToDto(savedOrder);
    }

    @Override
    public List<ShopOrderDto> getUserOrders(Integer userId) {
        return orderRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public ShopOrderDto getOrderByNumber(String orderNumber) {
        ShopOrder order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToDto(order);
    }

    // --- Operator Order & Tracking Methods ---
    @Override
    public List<ShopOrderDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public Page<ShopOrderDto> getAllOrders(String search, String customerName, String status, String paymentMethod, LocalDateTime startDate, LocalDateTime endDate, Integer page, Integer size, String sortBy, String direction) {
        return orderPagination.getPaginatedOrders(search, status, page, size, sortBy, direction);
    }

    @Override
    public ShopOrderDto updateTracking(Long orderId, DeliveryTrackingDto dto, String operatorEmail) {
        DeliveryTracking tracking = trackingRepository.findByShopOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Tracking not found for order"));
        
        if (dto.getCurrentStatus() != null) {
            int currentRank = getStatusRank(tracking.getCurrentStatus());
            int newRank = getStatusRank(dto.getCurrentStatus());

            if (newRank < currentRank && currentRank != -1) {
                throw new RuntimeException("Status cannot be moved backward from " + tracking.getCurrentStatus() + " to " + dto.getCurrentStatus());
            }

            tracking.setCurrentStatus(dto.getCurrentStatus());
            if (dto.getLatestUpdate() == null || dto.getLatestUpdate().isBlank()) {
                tracking.setLatestUpdate("Order status updated to " + dto.getCurrentStatus() + ".");
            }
            
            // Update order delivery status
            orderRepository.findById(orderId).ifPresent(order -> {
                order.setDeliveryStatus(dto.getCurrentStatus());
                orderRepository.save(order);
            });
        }
        if (dto.getCurrentLocation() != null) tracking.setCurrentLocation(dto.getCurrentLocation());
        if (dto.getCourierPartner() != null) tracking.setCourierPartner(dto.getCourierPartner());
        if (dto.getTrackingNumber() != null) tracking.setTrackingNumber(dto.getTrackingNumber());
        if (dto.getLatestUpdate() != null) tracking.setLatestUpdate(dto.getLatestUpdate());
        if (dto.getExpectedDeliveryDate() != null) tracking.setExpectedDeliveryDate(dto.getExpectedDeliveryDate());
        tracking.setUpdatedByOperator(operatorEmail);

        trackingRepository.save(tracking);
        return orderRepository.findById(orderId).map(this::mapToDto).orElse(null);
    }

    @Override
    public ShopOrderDto updateDeliveryStatus(Long orderId, String deliveryStatus) {
        ShopOrder order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        
        int currentRank = getStatusRank(order.getDeliveryStatus());
        int newRank = getStatusRank(deliveryStatus);

        if (newRank < currentRank && currentRank != -1) {
            throw new RuntimeException("Status cannot be moved backward from " + order.getDeliveryStatus() + " to " + deliveryStatus);
        }

        order.setDeliveryStatus(deliveryStatus);
        
        // Synchronize with DeliveryTracking to ensure frontend tracking modal matches
        trackingRepository.findByShopOrderId(orderId).ifPresent(tracking -> {
            if ("Delivered".equals(deliveryStatus) || "Out for Delivery".equals(deliveryStatus)) {
                tracking.setCurrentStatus(deliveryStatus);
            }
            tracking.setLatestUpdate("Order status updated to " + deliveryStatus + ".");
            trackingRepository.save(tracking);
        });

        return mapToDto(orderRepository.save(order));
    }

    private int getStatusRank(String status) {
        if (status == null) return -1;
        switch (status) {
            case "Ordered": return 0;
            case "Processing": return 1;
            case "Shipped": return 2;
            case "Out for Delivery": return 3;
            case "Delivered": return 4;
            default: return -1; // Unknown status
        }
    }


    // --- Mapping Helpers ---
    private ProductDto mapToDto(Product p) {
        ProductDto dto = new ProductDto();
        dto.setId(p.getId());
        dto.setShopId(p.getShopId());
        dto.setProductName(p.getProductName());
        dto.setCategory(p.getCategory());
        dto.setDescription(p.getDescription());
        dto.setPrice(p.getPrice());
        dto.setDiscountedPrice(p.getDiscountedPrice());
        dto.setStockQuantity(p.getStockQuantity());
        dto.setImages(p.getImages());
        dto.setThumbnail(p.getThumbnail());
        dto.setImageUrl(p.getImageUrl());
        dto.setTags(p.getTags());
        dto.setRating(p.getRating());
        dto.setStatus(p.getStatus());
        
        dto.setModerationStatus(p.getModerationStatus());
        dto.setSubmittedByUserId(p.getSubmittedByUserId());
        dto.setModerationRemarks(p.getModerationRemarks());
        dto.setApprovedBy(p.getApprovedBy());
        dto.setApprovedAt(p.getApprovedAt());
        dto.setRejectionReason(p.getRejectionReason());
        dto.setWhatsappNumber(p.getWhatsappNumber());
        dto.setPickupLocation(p.getPickupLocation());
        dto.setSellerCity(p.getSellerCity());
        dto.setSellerAddress(p.getSellerAddress());
        dto.setSellerName(p.getSellerName());
        dto.setSellerEmail(p.getSellerEmail());
        dto.setSellerPhone(p.getSellerPhone());

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

    private ArtisanDto mapToDto(Artisan a) {
        ArtisanDto dto = new ArtisanDto();
        dto.setId(a.getId());
        dto.setArtisanName(a.getArtisanName());
        dto.setCraft(a.getCraft());
        dto.setRegion(a.getRegion());
        dto.setDescription(a.getDescription());
        dto.setImageUrl(a.getImageUrl());
        dto.setIsActive(a.getIsActive());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setUpdatedAt(a.getUpdatedAt());
        return dto;
    }

    private CartDto mapToCartDto(Integer userId) {
        CartDto dto = new CartDto();
        dto.setId(userId.longValue());
        dto.setUserId(userId);
        List<CartItemDto> items = new ArrayList<>();
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        for (CartItem ci : cartItems) {
            CartItemDto cid = new CartItemDto();
            cid.setId(ci.getId());
            cid.setProductId(ci.getProductId());
            
            productRepository.findById(ci.getProductId()).ifPresent(p -> {
                cid.setProductName(p.getProductName());
                cid.setImageUrl(p.getImageUrl());
                cid.setPrice(p.getPrice());
            });
            
            cid.setQuantity(ci.getQuantity());
            items.add(cid);
        }
        dto.setCartItems(items);
        return dto;
    }

    private ShopOrderDto mapToDto(ShopOrder o) {
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
        dto.setAddress(o.getAddress());
        dto.setPhone(o.getPhone());
        dto.setCustomerName(o.getCustomerName());
        dto.setVendorPayoutStatus(o.getVendorPayoutStatus());
        dto.setVendorPayoutAmount(o.getVendorPayoutAmount());
        dto.setRefundRemarks(o.getRefundRemarks());
        dto.setCreatedAt(o.getCreatedAt());
        dto.setUpdatedAt(o.getUpdatedAt());

        List<OrderItemDto> items = new ArrayList<>();
        List<OrderItem> orderItems = orderItemRepository.findByShopOrderId(o.getId());
        for (OrderItem oi : orderItems) {
            OrderItemDto oid = new OrderItemDto();
            oid.setId(oi.getId());
            oid.setProductId(oi.getProductId());
            
            productRepository.findById(oi.getProductId()).ifPresent(p -> {
                oid.setProductName(p.getProductName());
                oid.setImageUrl(p.getImageUrl());
            });
            
            oid.setQuantity(oi.getQuantity());
            oid.setPrice(oi.getPrice());
            items.add(oid);
        }
        dto.setOrderItems(items);

        Optional<DeliveryTracking> tracking = trackingRepository.findByShopOrderId(o.getId());
        tracking.ifPresent(t -> {
            DeliveryTrackingDto tdto = new DeliveryTrackingDto();
            tdto.setId(t.getId());
            tdto.setCurrentStatus(t.getCurrentStatus());
            tdto.setCurrentLocation(t.getCurrentLocation());
            tdto.setCourierPartner(t.getCourierPartner());
            tdto.setTrackingNumber(t.getTrackingNumber());
            tdto.setLatestUpdate(t.getLatestUpdate());
            tdto.setExpectedDeliveryDate(t.getExpectedDeliveryDate());
            tdto.setUpdatedByOperator(t.getUpdatedByOperator());
            tdto.setUpdatedAt(t.getUpdatedAt());
            dto.setTracking(tdto);
        });

        return dto;
    }
}
