package com.kumbh.service;

import com.kumbh.dto.VendorApplicationDto;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

public interface VendorApplicationService {

    // ── User facing methods ───────────────────────────────────────────
    VendorApplicationDto apply(VendorApplicationDto dto, Integer userId);
    VendorApplicationDto uploadDocuments(Integer userId, MultipartFile document, MultipartFile license, MultipartFile logo, MultipartFile banner);
    VendorApplicationDto getMyApplication(Integer userId);

    // ── Operator facing methods ───────────────────────────────────────
    Page<VendorApplicationDto> searchApplications(String query, String status, Integer page, Integer size, String sortBy, String direction);
    VendorApplicationDto getApplicationById(Long id);
    VendorApplicationDto reviewApplication(Long id, String status, String remarks, String operatorName);
}
