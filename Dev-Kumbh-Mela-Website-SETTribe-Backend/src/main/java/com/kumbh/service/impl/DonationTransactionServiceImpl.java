package com.kumbh.service.impl;

import com.kumbh.dto.DonationTransactionDto;
import com.kumbh.entity.DonationTransaction;
import com.kumbh.pagination.DonationTransactionPagination;
import com.kumbh.repository.DonationTransactionRepository;
import com.kumbh.service.DonationTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DonationTransactionServiceImpl implements DonationTransactionService {

    @Autowired
    private DonationTransactionRepository repository;

    @Autowired
    private DonationTransactionPagination pagination;

    @Override
    public DonationTransaction createDonation(DonationTransaction donation) {
        if (repository.findByTransactionReference(donation.getTransactionReference()).isPresent()) {
            throw new RuntimeException("Transaction Reference already exists!");
        }
        donation.setStatus("PENDING");
        return repository.save(donation);
    }

    @Override
    public Page<DonationTransaction> getAllDonations(Pageable pageable, String search) {
        if (search != null && !search.trim().isEmpty()) {
            return repository.searchDonations(search, pageable);
        }
        return repository.findAll(pageable);
    }

    @Override
    public Page<DonationTransactionDto> getPaginatedDonations(String search, Integer page, Integer size, String sortBy, String direction) {
        return pagination.getPaginatedDonations(search, page, size, sortBy, direction);
    }

    @Override
    public List<DonationTransaction> getAllDonationsList() {
        return repository.findAll();
    }

    @Override
    public DonationTransaction verifyDonation(Long id) {
        DonationTransaction donation = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Donation record not found!"));
        donation.setStatus("VERIFIED");
        return repository.save(donation);
    }
}
