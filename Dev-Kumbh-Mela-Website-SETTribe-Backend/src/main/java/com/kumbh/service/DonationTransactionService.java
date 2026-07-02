package com.kumbh.service;

import com.kumbh.dto.DonationTransactionDto;
import com.kumbh.entity.DonationTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface DonationTransactionService {
    DonationTransaction createDonation(DonationTransaction donation);
    Page<DonationTransaction> getAllDonations(Pageable pageable, String search);
    Page<DonationTransactionDto> getPaginatedDonations(String search, Integer page, Integer size, String sortBy, String direction);
    List<DonationTransaction> getAllDonationsList();
    DonationTransaction verifyDonation(Long id);
}
