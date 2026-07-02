package com.kumbh.seeders;

import com.kumbh.entity.*;
import com.kumbh.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@Order(2)
public class ShopSeeder {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ArtisanRepository artisanRepository;
    @Autowired
    private CartItemRepository cartItemRepository;
    @Autowired
    private ShopOrderRepository orderRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private DeliveryTrackingRepository trackingRepository;
    @Autowired
    private UserAddressRepository userAddressRepository;


    public void seed() {
        boolean isSeeding = artisanRepository.count() == 0;
        seedArtisans();
        seedProducts();
        seedUserContext();
        if (isSeeding) System.out.println("Shop data seeded successfully!");
    }

    private void seedArtisans() {
        if (artisanRepository.count() == 0) {
            
            saveArtisan("Ram Swarup Kumbhakar", "Sacred Pottery", "Nashik Kumbh Village", "A master of traditional clay pottery specializing in sacred Kalash.", "/src/assets/blue_pottery.png");
            saveArtisan("Lata Devi", "Paithani Weaving", "Paithan, Maharashtra", "Expert in hand-woven silk sarees and spiritual stoles.", "/src/assets/spiritual_bg.png");
            saveArtisan("Mohan Lal Vishwakarma", "Sandalwood Carving", "Nashik Heritage Hub", "Specializes in intricate sandalwood idols.", "/src/assets/sandalwood.png");
            saveArtisan("Kiran Verma", "Divine Brass Work", "Brass Colony, Nashik", "A fourth-generation brass smith specializing in divine diyas.", "/src/assets/brass_diya.png");
            saveArtisan("Rajesh Prajapati", "Holy Stone Sculpting", "Nashik Region", "Master of stone sculpting for small-scale replicas.", "/src/assets/shivalingam.png");
        }
    }

    private void seedProducts() {
        if (productRepository.count() == 0) {

            saveProduct("Sacred 5-Mukhi Rudraksha Mala", "Spiritual", "Authentic 108+1 beads Panchmukhi Rudraksha for meditation.", "899.00", 150, "/src/assets/rudraksha_mala.png");
            saveProduct("Handcrafted Brass Ganesha", "Temple Decor", "Premium 6-inch brass idol of Lord Ganesha.", "2499.00", 45, "/src/assets/ganesha_idol.png");
            saveProduct("Energized Godavari Jal", "Sacred Essentials", "Holy water collected from the Kushavarta Kund.", "250.00", 300, "/src/assets/ganga_jal.png");
            saveProduct("Premium Sandalwood Incense", "Ritual Supplies", "Pure natural sandalwood incense sticks.", "180.00", 500, "/src/assets/incense_sticks.png");
            saveProduct("Copper Pooja Thali Set", "Pooja Utensils", "Pure copper utensils set for daily rituals.", "1500.00", 60, "/src/assets/pooja_thali.png");
        }
    }

    private void seedUserContext() {
        User user = userRepository.findByEmail("aditya@example.com").orElse(null);
        if (user == null) return;

        if (userAddressRepository.count() == 0) {
            UserAddress address = new UserAddress();
            address.setUser(user);
            address.setName("Rahul Sharma");
            address.setPhone("+91 98765 43210");
            address.setPincode("411001");
            address.setHouseNo("108");
            address.setArea("Shanti Apartments, MG Road");
            address.setLandmark("Near MG Road");
            address.setCity("Pune");
            address.setCityVillage("Pune");
            address.setState("Maharashtra");
            address.setStateCode("MH");
            address.setAddressType("Home");
            address.setIsDefault(true);
            address.setIsDeleted(false);
            userAddressRepository.save(address);
        }

        if (cartItemRepository.count() == 0) {
            productRepository.findAll().stream().limit(2).forEach(p -> {
                CartItem item = new CartItem();
                item.setUserId(user.getId());
                item.setProductId(p.getId());
                item.setQuantity(1);
                cartItemRepository.save(item);
            });
        }

        if (orderRepository.count() == 0) {
            List<Product> products = productRepository.findAll();
            if (products.size() >= 3) {
                createSeedOrder(user, products.get(0), "KUMBH-849201", "In Transit", 1,
                        LocalDateTime.of(2026, 5, 21, 10, 30),
                        LocalDateTime.of(2026, 5, 24, 18, 0),
                        "Mahakumbh Logistics",
                        "123456789",
                        "Package has arrived at Prayagraj Sorting Center.");

                createSeedOrder(user, products.get(1), "KUMBH-773821", "Delivered", 2,
                        LocalDateTime.of(2026, 4, 15, 9, 15),
                        LocalDateTime.of(2026, 4, 18, 15, 45),
                        "India Post",
                        "IPKUMBH773821",
                        "Delivered successfully to the pilgrim address.");

                createSeedOrder(user, products.get(2), "KUMBH-691012", "Delivered", 2,
                        LocalDateTime.of(2026, 3, 10, 12, 0),
                        LocalDateTime.of(2026, 3, 13, 16, 20),
                        "Mahakumbh Logistics",
                        "MKL691012",
                        "Delivered successfully to the pilgrim address.");
            }
        }
    }

    private void createSeedOrder(User user, Product product, String orderNumber, String status, int quantity,
                                 LocalDateTime placedAt, LocalDateTime expectedOrDeliveredAt,
                                 String courierPartner, String trackingNumber, String latestUpdate) {
        ShopOrder order = new ShopOrder();
        order.setUserId(user.getId());
        order.setOrderNumber(orderNumber);
        order.setAddress("Apt 402, Godavari Greens, Nashik, Maharashtra 422003");
        order.setPaymentMethod("UPI");
        order.setPaymentStatus("COMPLETED");
        order.setCustomerName(user.getName());
        order.setOrderStatus(status);
        order.setDeliveryStatus(status);
        BigDecimal total = product.getPrice().multiply(BigDecimal.valueOf(quantity));
        order.setTotalAmount(total);
        order.setGrandTotal(total);
        order.setCreatedAt(placedAt);
        order.setUpdatedAt(expectedOrDeliveredAt);
        ShopOrder savedOrder = orderRepository.save(order);

        OrderItem oItem = new OrderItem();
        oItem.setShopOrderId(savedOrder.getId());
        oItem.setProductId(product.getId());
        oItem.setQuantity(quantity);
        oItem.setPrice(product.getPrice());
        orderItemRepository.save(oItem);

        DeliveryTracking tracking = new DeliveryTracking();
        tracking.setShopOrderId(savedOrder.getId());
        tracking.setCurrentStatus(status);
        tracking.setCurrentLocation(status.equals("Delivered") ? "Delivered at pilgrim address" : "Prayagraj Sorting Center");
        tracking.setCourierPartner(courierPartner);
        tracking.setTrackingNumber(trackingNumber);
        tracking.setLatestUpdate(latestUpdate);
        tracking.setExpectedDeliveryDate(expectedOrDeliveredAt);
        tracking.setUpdatedAt(expectedOrDeliveredAt);
        trackingRepository.save(tracking);
    }

    private void saveArtisan(String name, String craft, String region, String desc, String img) {
        artisanRepository.save(new Artisan(name, craft, region, desc, img, true));
    }

    private void saveProduct(String name, String cat, String desc, String price, int stock, String img) {
        Product p = new Product();
        p.setProductName(name);
        p.setCategory(cat);
        p.setDescription(desc);
        p.setPrice(new BigDecimal(price));
        p.setStockQuantity(stock);
        p.setImageUrl(img);
        p.setIsActive(true);
        p.setModerationStatus("APPROVED");
        p.setVisibleInMarketplace(true);
        p.setStatus("ACTIVE");
        productRepository.save(p);
    }
}
