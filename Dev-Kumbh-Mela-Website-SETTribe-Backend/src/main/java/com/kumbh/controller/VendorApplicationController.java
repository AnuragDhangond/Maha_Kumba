package com.kumbh.controller;

import com.kumbh.dto.VendorApplicationDto;
import com.kumbh.security.JwtUtil;
import com.kumbh.service.VendorApplicationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/vendors")
public class VendorApplicationController {

    @Autowired private VendorApplicationService applicationService;

    private Integer getUserIdFromContext() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal == null || principal.equals("anonymousUser")) {
            throw new RuntimeException("Unauthorized");
        }
        return ((Long) principal).intValue();
    }

    private String extractOperatorName(Authentication auth) {
        if (auth != null && auth.getName() != null) return auth.getName();
        return "operator@mahakumbh.in";
    }

    // ── USER: Submit application ──────────────────────────────────
    @PostMapping("/apply")
    public ResponseEntity<?> apply(
            @Valid @RequestBody VendorApplicationDto dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(applicationService.apply(dto, getUserIdFromContext()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── USER: Upload supporting documents ─────────────────────────
    @PostMapping("/apply/documents")
    public ResponseEntity<?> uploadDocuments(
            @RequestPart(value = "document", required = false) MultipartFile document,
            @RequestPart(value = "license",  required = false) MultipartFile license,
            @RequestPart(value = "logo",     required = false) MultipartFile logo,
            @RequestPart(value = "banner",   required = false) MultipartFile banner) {
        try {
            return ResponseEntity.ok(applicationService.uploadDocuments(
                    getUserIdFromContext(), document, license, logo, banner));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── USER: Check own application status ────────────────────────
    @GetMapping("/my-application")
    public ResponseEntity<?> getMyApplication() {
        try {
            return ResponseEntity.ok(applicationService.getMyApplication(getUserIdFromContext()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    // ── OPERATOR: Application queue ───────────────────────────────
    @GetMapping("/queue")
    public ResponseEntity<Page<VendorApplicationDto>> getQueue(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0")    Integer page,
            @RequestParam(defaultValue = "20")   Integer size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        return ResponseEntity.ok(
                applicationService.searchApplications(query, status, page, size, sortBy, direction));
    }

    // ── OPERATOR: Get one application ─────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> getApplication(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(applicationService.getApplicationById(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ── OPERATOR: Review decision ─────────────────────────────────
    /**
     * PATCH /api/vendors/{id}/review
     * Body: { "decision": "APPROVED|REJECTED|CHANGES_REQUESTED|BLOCKED", "remarks": "..." }
     */
    @PatchMapping("/{id}/review")
    public ResponseEntity<?> review(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        try {
            String decision = body.getOrDefault("decision", "");
            String remarks  = body.getOrDefault("remarks", "");
            return ResponseEntity.ok(
                    applicationService.reviewApplication(id, decision, remarks, extractOperatorName(auth)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
