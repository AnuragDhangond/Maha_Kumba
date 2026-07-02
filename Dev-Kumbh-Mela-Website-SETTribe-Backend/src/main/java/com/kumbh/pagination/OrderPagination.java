package com.kumbh.pagination;

import com.kumbh.dto.DeliveryTrackingDto;
import com.kumbh.dto.OrderItemDto;
import com.kumbh.dto.ShopOrderDto;
import com.kumbh.entity.DeliveryTracking;
import com.kumbh.entity.OrderItem;
import com.kumbh.entity.Product;
import com.kumbh.entity.ShopOrder;
import com.kumbh.repository.DeliveryTrackingRepository;
import com.kumbh.repository.OrderItemRepository;
import com.kumbh.repository.ProductRepository;
import com.kumbh.repository.ShopOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class OrderPagination {

    @Autowired
    private ShopOrderRepository orderRepository;

    @Autowired
    private DeliveryTrackingRepository trackingRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    public Page<ShopOrderDto> getPaginatedOrders(String search, String status, Integer page, Integer size, String sortBy, String direction) {
        // Centralized Pagination Defaults
        int pageNum = (page == null) ? 0 : page;
        int pageSize = (size == null) ? 10 : size;
        String sortKey = (sortBy == null || sortBy.isBlank()) ? "id" : sortBy;
        String sortDir = (direction == null || direction.isBlank()) ? "desc" : direction;

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortKey).descending() : Sort.by(sortKey).ascending();
        Pageable pageable = PageRequest.of(pageNum, pageSize, sort);
        
        Page<ShopOrder> orderPage = orderRepository.searchOrders(search, status, null, null, pageable);
        return orderPage.map(this::mapToDto);
    }

    private ShopOrderDto mapToDto(ShopOrder o) {
        ShopOrderDto dto = new ShopOrderDto();
        dto.setId(o.getId());
        dto.setOrderNumber(o.getOrderNumber());
        dto.setUserId(o.getUserId());
        dto.setTotalAmount(o.getTotalAmount());
        dto.setPaymentMethod(o.getPaymentMethod());
        dto.setOrderStatus(o.getOrderStatus());
        dto.setDeliveryStatus(o.getDeliveryStatus());
        dto.setAddress(o.getAddress());
        dto.setCustomerName(o.getCustomerName());
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
            tdto.setExpectedDeliveryDate(t.getExpectedDeliveryDate());
            tdto.setUpdatedByOperator(t.getUpdatedByOperator());
            tdto.setUpdatedAt(t.getUpdatedAt());
            dto.setTracking(tdto);
        });

        return dto;
    }
}
