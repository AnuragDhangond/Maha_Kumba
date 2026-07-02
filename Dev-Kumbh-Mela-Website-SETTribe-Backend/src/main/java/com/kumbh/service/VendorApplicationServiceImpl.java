package com.kumbh.service;

import com.kumbh.dto.VendorApplicationDto;
import com.kumbh.entity.Shop;
import com.kumbh.entity.User;
import com.kumbh.entity.VendorApplication;
import com.kumbh.repository.ShopRepository;
import com.kumbh.repository.UserRepository;
import com.kumbh.repository.VendorApplicationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
public class VendorApplicationServiceImpl implements VendorApplicationService {

    private static final Logger log = LoggerFactory.getLogger(VendorApplicationServiceImpl.class);
    private static final String UPLOAD_DIR = "uploads/vendor-docs/";

    // Blocked keywords for shop name / description sanitization
    private static final List<String> BLOCKED_WORDS = List.of(
            "fake", "spam", "illegal", "drugs", "weapon", "piracy", "hack"
    );

    @Autowired private VendorApplicationRepository applicationRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private ShopRepository shopRepo;

    // ─────────────────────────────────────────────────────────────
    // USER: Submit vendor application
    // ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public VendorApplicationDto apply(VendorApplicationDto dto, Integer userId) {
        log.info("Vendor application submitted by userId={}", userId);

        // Guard: only one application per user
        if (applicationRepo.existsByUserId(userId)) {
            throw new RuntimeException("You have already submitted a vendor application.");
        }

        // Guard: unique shop name
        if (applicationRepo.existsByShopNameIgnoreCase(dto.getShopName())) {
            throw new RuntimeException("A shop with this name already exists. Please choose a unique shop name.");
        }

        // Guard: profanity / restricted keywords
        sanitizeText(dto.getShopName(), "Shop name");
        if (dto.getShopDescription() != null) sanitizeText(dto.getShopDescription(), "Description");

        // Build entity
        VendorApplication app = new VendorApplication();
        app.setUserId(userId);
        app.setFullName(dto.getFullName());
        app.setEmail(dto.getEmail());
        app.setPhone(dto.getPhone());
        app.setWhatsappNumber(dto.getWhatsappNumber());
        app.setShopName(dto.getShopName());
        app.setShopCategory(dto.getShopCategory());
        app.setShopDescription(dto.getShopDescription());
        app.setAddress(dto.getAddress());
        app.setCity(dto.getCity() != null ? dto.getCity() : "Nashik");
        app.setState(dto.getState() != null ? dto.getState() : "Maharashtra");
        app.setPincode(dto.getPincode());
        app.setLandmark(dto.getLandmark());
        app.setGstNumber(dto.getGstNumber());
        app.setLatitude(dto.getLatitude());
        app.setLongitude(dto.getLongitude());
        app.setGoogleMapLink(dto.getGoogleMapLink());
        app.setOpeningTime(dto.getOpeningTime() != null ? dto.getOpeningTime() : "09:00");
        app.setClosingTime(dto.getClosingTime() != null ? dto.getClosingTime() : "21:00");
        app.setApplicationStatus("PENDING");

        VendorApplication saved = applicationRepo.save(app);

        // Upgrade user role to VENDOR_PENDING
        userRepo.findById(userId).ifPresent(user -> {
            user.setRole("vendor_pending");
            userRepo.save(user);
            log.info("User {} role upgraded to vendor_pending", userId);
        });

        return toDto(saved);
    }

    // ─────────────────────────────────────────────────────────────
    // USER: Upload documents (multipart, separate from apply form)
    // ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public VendorApplicationDto uploadDocuments(Integer userId, MultipartFile document,
                                                MultipartFile license, MultipartFile logo,
                                                MultipartFile banner) {
        VendorApplication app = applicationRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("No application found. Please submit your application first."));

        if (document != null && !document.isEmpty()) app.setDocumentUrl(saveFile(document, "doc"));
        if (license  != null && !license.isEmpty())  app.setShopLicenseUrl(saveFile(license, "license"));
        if (logo     != null && !logo.isEmpty())     app.setLogoImage(saveFile(logo, "logo"));
        if (banner   != null && !banner.isEmpty())   app.setBannerImage(saveFile(banner, "banner"));

        // Move to UNDER_REVIEW once documents are uploaded
        if ("PENDING".equals(app.getApplicationStatus())) {
            app.setApplicationStatus("UNDER_REVIEW");
        }

        return toDto(applicationRepo.save(app));
    }

    // ─────────────────────────────────────────────────────────────
    // USER: Get own application status
    // ─────────────────────────────────────────────────────────────

    @Override
    public VendorApplicationDto getMyApplication(Integer userId) {
        return toDto(applicationRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("No vendor application found.")));
    }

    // ─────────────────────────────────────────────────────────────
    // OPERATOR: Paginated application queue
    // ─────────────────────────────────────────────────────────────

    @Override
    public Page<VendorApplicationDto> searchApplications(String query, String status,
                                                         Integer page, Integer size,
                                                         String sortBy, String direction) {
        Sort sort = "asc".equalsIgnoreCase(direction)
                ? Sort.by(sortBy != null ? sortBy : "createdAt").ascending()
                : Sort.by(sortBy != null ? sortBy : "createdAt").descending();
        Pageable pageable = PageRequest.of(page != null ? page : 0, size != null ? size : 20, sort);
        return applicationRepo.searchApplications(query, status, pageable).map(this::toDto);
    }

    @Override
    public VendorApplicationDto getApplicationById(Long id) {
        return toDto(applicationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found: " + id)));
    }

    // ─────────────────────────────────────────────────────────────
    // OPERATOR: Review decision (Approve / Reject / Changes / Suspend)
    // ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public VendorApplicationDto reviewApplication(Long id, String decision,
                                                  String remarks, String operatorName) {
        VendorApplication app = applicationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found: " + id));

        decision = decision.toUpperCase();
        app.setApplicationStatus(decision);
        app.setReviewerNotes(remarks);
        app.setReviewedBy(operatorName);
        app.setReviewedAt(LocalDateTime.now());

        switch (decision) {
            case "APPROVED" -> {
                // 1. Upgrade user role to vendor
                User user = userRepo.findById(app.getUserId())
                        .orElseThrow(() -> new RuntimeException("User not found"));
                user.setRole("vendor");
                userRepo.save(user);

                // 2. Auto-create and activate the shop
                Shop shop = new Shop();
                shop.setOwnerUserId(app.getUserId());
                shop.setOwnerName(app.getFullName());
                shop.setShopName(app.getShopName());
                shop.setShopSlug(generateSlug(app.getShopName()));
                shop.setCategory(app.getShopCategory());
                shop.setDescription(app.getShopDescription());
                shop.setEmail(app.getEmail());
                shop.setPhone(app.getPhone());
                shop.setWhatsappNumber(app.getWhatsappNumber());
                shop.setAddress(app.getAddress());
                shop.setCity(app.getCity());
                shop.setState(app.getState());
                shop.setPincode(app.getPincode());
                shop.setLandmark(app.getLandmark());
                shop.setLatitude(app.getLatitude());
                shop.setLongitude(app.getLongitude());
                shop.setGoogleMapLink(app.getGoogleMapLink());
                shop.setLogoImage(app.getLogoImage());
                shop.setBannerImage(app.getBannerImage());
                shop.setOpeningTime(LocalTime.parse(app.getOpeningTime() != null ? app.getOpeningTime() : "09:00"));
                shop.setClosingTime(LocalTime.parse(app.getClosingTime() != null ? app.getClosingTime() : "21:00"));
                shop.setStatus("ACTIVE");
                shop.setIsVerified(true);
                shop.setVerificationStatus("APPROVED");
                shop.setVerificationRemarks("Auto-approved via Vendor Application #" + id);

                Shop savedShop = shopRepo.save(shop);
                app.setShopId(savedShop.getId());

                log.info("Vendor application {} APPROVED — shop created id={}, user {} upgraded to vendor",
                        id, savedShop.getId(), app.getUserId());
            }
            case "REJECTED" -> {
                // Downgrade role back to user
                userRepo.findById(app.getUserId()).ifPresent(u -> {
                    u.setRole("user");
                    userRepo.save(u);
                });
                log.info("Vendor application {} REJECTED — user {} role reset to user", id, app.getUserId());
            }
            case "CHANGES_REQUESTED" -> {
                // Keep role as vendor_pending, notify via remarks
                log.info("Vendor application {} — changes requested from operator {}", id, operatorName);
            }
            case "BLOCKED" -> {
                userRepo.findById(app.getUserId()).ifPresent(u -> {
                    u.setRole("user");
                    u.setActive(false);
                    userRepo.save(u);
                });
                log.warn("Vendor application {} BLOCKED — user {} deactivated", id, app.getUserId());
            }
            default -> throw new RuntimeException("Invalid decision: " + decision +
                    ". Valid: APPROVED, REJECTED, CHANGES_REQUESTED, BLOCKED");
        }

        return toDto(applicationRepo.save(app));
    }

    // ─────────────────────────────────────────────────────────────
    // Private Helpers
    // ─────────────────────────────────────────────────────────────

    private void sanitizeText(String text, String fieldName) {
        if (text == null) return;
        String lower = text.toLowerCase();
        for (String word : BLOCKED_WORDS) {
            if (lower.contains(word)) {
                throw new RuntimeException(fieldName + " contains restricted content: '" + word + "'");
            }
        }
    }

    private String saveFile(MultipartFile file, String prefix) {
        String original = file.getOriginalFilename();
        if (original != null) {
            String lower = original.toLowerCase();
            boolean isImage = lower.endsWith(".jpg") || lower.endsWith(".jpeg")
                    || lower.endsWith(".png") || lower.endsWith(".webp");
            boolean isPdf = lower.endsWith(".pdf");
            if (!isImage && !isPdf) {
                throw new RuntimeException("Invalid file format for " + prefix + ". Allowed: JPG, PNG, WebP, PDF");
            }
            long maxBytes = 5 * 1024 * 1024; // 5 MB
            if (file.getSize() > maxBytes) {
                throw new RuntimeException("File too large for " + prefix + ". Max size: 5 MB");
            }
        }
        try {
            String filename = prefix + "_" + UUID.randomUUID() + "_" + original;
            Path path = Paths.get(UPLOAD_DIR + filename);
            Files.createDirectories(path.getParent());
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/vendor-docs/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + prefix, e);
        }
    }

    private String generateSlug(String name) {
        String slug = name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim().replaceAll("\\s+", "-");
        if (shopRepo.existsByShopSlug(slug)) slug = slug + "-" + System.currentTimeMillis();
        return slug;
    }

    private VendorApplicationDto toDto(VendorApplication a) {
        VendorApplicationDto d = new VendorApplicationDto();
        d.setId(a.getId());
        d.setUserId(a.getUserId());
        d.setFullName(a.getFullName());
        d.setEmail(a.getEmail());
        d.setPhone(a.getPhone());
        d.setWhatsappNumber(a.getWhatsappNumber());
        d.setShopName(a.getShopName());
        d.setShopCategory(a.getShopCategory());
        d.setShopDescription(a.getShopDescription());
        d.setAddress(a.getAddress());
        d.setCity(a.getCity());
        d.setState(a.getState());
        d.setPincode(a.getPincode());
        d.setLandmark(a.getLandmark());
        d.setGstNumber(a.getGstNumber());
        d.setLatitude(a.getLatitude());
        d.setLongitude(a.getLongitude());
        d.setGoogleMapLink(a.getGoogleMapLink());
        d.setOpeningTime(a.getOpeningTime());
        d.setClosingTime(a.getClosingTime());
        d.setDocumentUrl(a.getDocumentUrl());
        d.setShopLicenseUrl(a.getShopLicenseUrl());
        d.setLogoImage(a.getLogoImage());
        d.setBannerImage(a.getBannerImage());
        d.setApplicationStatus(a.getApplicationStatus());
        d.setReviewerNotes(a.getReviewerNotes());
        d.setReviewedBy(a.getReviewedBy());
        d.setReviewedAt(a.getReviewedAt());
        d.setShopId(a.getShopId());
        d.setCreatedAt(a.getCreatedAt());
        d.setUpdatedAt(a.getUpdatedAt());
        return d;
    }
}
