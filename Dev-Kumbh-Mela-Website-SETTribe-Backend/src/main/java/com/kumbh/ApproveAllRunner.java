package com.kumbh;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import com.kumbh.repository.ProductRepository;
import com.kumbh.entity.Product;
import java.util.List;

@Component
public class ApproveAllRunner implements CommandLineRunner {
    private final ProductRepository productRepository;

    public ApproveAllRunner(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        List<Product> products = productRepository.findAll();
        for (Product p : products) {
            p.setModerationStatus("APPROVED");
            p.setIsActive(true);
            p.setStatus("ACTIVE");
            p.setVisibleInMarketplace(true);
            productRepository.save(p);
        }
        System.out.println("====== ALL PRODUCTS AUTOMATICALLY APPROVED ======");
    }
}
