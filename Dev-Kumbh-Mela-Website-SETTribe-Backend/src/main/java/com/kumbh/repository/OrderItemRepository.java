package com.kumbh.repository;

import com.kumbh.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByShopOrderId(Long shopOrderId);
    void deleteByShopOrderId(Long shopOrderId);
}
