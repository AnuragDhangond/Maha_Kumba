package com.kumbh.repository;

import com.kumbh.entity.PoojaBooking;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PoojaBookingRepository extends JpaRepository<PoojaBooking, Long> {

    @Query("SELECT p FROM PoojaBooking p WHERE " +
            "LOWER(p.devoteeName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.acharyaName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.poojaName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.location) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.status) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<PoojaBooking> searchBookings(@Param("search") String search, Pageable pageable);

    boolean existsByAcharyaIdAndPreferredDateAndPreferredSlotAndStatusNot(
            Long acharyaId, String preferredDate, String preferredSlot, String status);

    @Query("SELECT p.preferredSlot FROM PoojaBooking p WHERE p.acharyaId = :acharyaId AND p.preferredDate = :date AND p.status != :status")
    List<String> findBookedSlots(@Param("acharyaId") Long acharyaId, @Param("date") String date, @Param("status") String status);

    boolean existsByPoojaId(Long poojaId);
}
