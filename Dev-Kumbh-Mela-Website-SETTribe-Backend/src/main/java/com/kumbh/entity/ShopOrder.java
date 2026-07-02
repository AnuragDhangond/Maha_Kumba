package com.kumbh.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "shop_orders")
public class ShopOrder extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", unique = true, nullable = false)
    private String orderNumber;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    /** Root shop that fulfils the order */
    @Column(name = "shop_id")
    private Long shopId;

    /** User who owns the shop (denormalised for fast payout queries) */
    @Column(name = "vendor_id")
    private Integer vendorId;

    @Column(name = "total_amount", precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "delivery_charge", precision = 10, scale = 2)
    private BigDecimal deliveryCharge = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "grand_total", precision = 12, scale = 2)
    private BigDecimal grandTotal;

    @Column(name = "payment_method")
    private String paymentMethod;

    /** PENDING | COMPLETED | FAILED | REFUNDED */
    @Column(name = "payment_status")
    private String paymentStatus = "PENDING";

    /** PENDING | CONFIRMED | PACKED | SHIPPED | DELIVERED | CANCELLED */
    @Column(name = "order_status")
    private String orderStatus = "PENDING";

    @Column(name = "delivery_status")
    private String deliveryStatus = "PENDING";

    @Column(name = "customer_name")
    private String customerName;

    private String phone;

    @Column(name = "shipping_address", length = 500)
    private String address;

    /** PENDING | ESCROWED | PAID | REFUND_DEDUCTED */
    @Column(name = "vendor_payout_status")
    private String vendorPayoutStatus = "PENDING";

    @Column(name = "vendor_payout_amount", precision = 12, scale = 2)
    private BigDecimal vendorPayoutAmount = BigDecimal.ZERO;

    @Column(name = "refund_remarks", columnDefinition = "TEXT")
    private String refundRemarks;

    public ShopOrder() {}

    // ── Getters & Setters ─────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public Long getShopId() { return shopId; }
    public void setShopId(Long shopId) { this.shopId = shopId; }

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
}
