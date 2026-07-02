package com.kumbh.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ShopOrderDto {
    private Long id;
    private String orderNumber;
    private Integer userId;
    private Long shopId;
    private String shopName;
    private Integer vendorId;
    private BigDecimal totalAmount;
    private BigDecimal taxAmount;
    private BigDecimal deliveryCharge;
    private BigDecimal discountAmount;
    private BigDecimal grandTotal;
    private String paymentMethod;
    private String paymentStatus;
    private String orderStatus;
    private String deliveryStatus;
    private String customerName;
    private String phone;
    private String address;
    private String vendorPayoutStatus;
    private BigDecimal vendorPayoutAmount;
    private String refundRemarks;
    private List<OrderItemDto> orderItems;
    private DeliveryTrackingDto tracking;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Getters & Setters ──────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public Long getShopId() { return shopId; }
    public void setShopId(Long shopId) { this.shopId = shopId; }

    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }

    public Integer getVendorId() { return vendorId; }
    public void setVendorId(Integer vendorId) { this.vendorId = vendorId; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    public BigDecimal getDeliveryCharge() { return deliveryCharge; }
    public void setDeliveryCharge(BigDecimal deliveryCharge) { this.deliveryCharge = deliveryCharge; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public BigDecimal getGrandTotal() { return grandTotal; }
    public void setGrandTotal(BigDecimal grandTotal) { this.grandTotal = grandTotal; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }

    public String getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(String deliveryStatus) { this.deliveryStatus = deliveryStatus; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getVendorPayoutStatus() { return vendorPayoutStatus; }
    public void setVendorPayoutStatus(String vendorPayoutStatus) { this.vendorPayoutStatus = vendorPayoutStatus; }

    public BigDecimal getVendorPayoutAmount() { return vendorPayoutAmount; }
    public void setVendorPayoutAmount(BigDecimal vendorPayoutAmount) { this.vendorPayoutAmount = vendorPayoutAmount; }

    public String getRefundRemarks() { return refundRemarks; }
    public void setRefundRemarks(String refundRemarks) { this.refundRemarks = refundRemarks; }

    public List<OrderItemDto> getOrderItems() { return orderItems; }
    public void setOrderItems(List<OrderItemDto> orderItems) { this.orderItems = orderItems; }

    public DeliveryTrackingDto getTracking() { return tracking; }
    public void setTracking(DeliveryTrackingDto tracking) { this.tracking = tracking; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
