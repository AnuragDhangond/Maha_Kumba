package com.kumbh.repository;

import com.kumbh.entity.DonationTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DonationTransactionRepository extends JpaRepository<DonationTransaction, Long> {
    Optional<DonationTransaction> findByTransactionReference(String transactionReference);

    @Query("SELECT d FROM DonationTransaction d WHERE " +
           "LOWER(d.donorName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.donorEmail) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.transactionReference) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.status) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<DonationTransaction> searchDonations(@Param("query") String query, Pageable pageable);
}
