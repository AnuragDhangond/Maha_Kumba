package com.kumbh.dto;

import jakarta.validation.constraints.NotBlank;

public class CheckoutRequestDto {
    @NotBlank(message = "Shipping address is required")
    private String address;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    @NotBlank(message = "Customer name is required")
    private String customerName;

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}
