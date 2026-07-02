package com.kumbh.dto;

import java.util.List;

public class CartDto {
    private Long id;
    private Integer userId;
    private List<CartItemDto> cartItems;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public List<CartItemDto> getCartItems() { return cartItems; }
    public void setCartItems(List<CartItemDto> cartItems) { this.cartItems = cartItems; }
}
