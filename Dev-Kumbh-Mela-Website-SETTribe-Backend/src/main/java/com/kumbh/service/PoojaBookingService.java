package com.kumbh.service;

import com.kumbh.dto.PoojaBookingDTO;
import com.kumbh.entity.PoojaBooking;
import com.kumbh.pagination.PoojaBookingPagination;
import com.kumbh.repository.PoojaBookingRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PoojaBookingService {

    @Autowired
    private PoojaBookingRepository repository;

    @Autowired
    private PoojaBookingPagination pagination;

    @Autowired
    private NotificationService notificationService;

    public Page<PoojaBookingDTO> getAllBookings(String search, Integer page, Integer size, String sortBy, String direction) {
        return pagination.getPaginatedBookings(search, page, size, sortBy, direction);
    }

    @Transactional
    public PoojaBookingDTO createBooking(PoojaBookingDTO dto) {
        // Check if slot is already booked (excluding CANCELLED status)
        boolean alreadyBooked = repository.existsByAcharyaIdAndPreferredDateAndPreferredSlotAndStatusNot(
                dto.getAcharyaId(), dto.getPreferredDate(), dto.getPreferredSlot(), "CANCELLED");
        
        if (alreadyBooked) {
            throw new RuntimeException("This time slot is already booked for the selected Acharya. Please choose another slot or date.");
        }

        PoojaBooking booking = new PoojaBooking();
        BeanUtils.copyProperties(dto, booking, "id", "createdAt", "updatedAt");
        if (booking.getStatus() == null || booking.getStatus().isBlank()) {
            booking.setStatus("PENDING");
        }
        PoojaBooking saved = repository.save(booking);
        notificationService.sendBookingReceived(saved);
        return convertToDTO(saved);
    }

    public List<String> getBookedSlots(Long acharyaId, String date) {
        return repository.findBookedSlots(acharyaId, date, "CANCELLED");
    }

    public PoojaBookingDTO updateStatus(Long id, String status) {
        PoojaBooking booking = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pooja booking not found with id: " + id));
        
        String oldStatus = booking.getStatus();
        booking.setStatus(status);
        PoojaBooking saved = repository.save(booking);

        if (!"CONFIRMED".equals(oldStatus) && "CONFIRMED".equals(status)) {
            notificationService.sendBookingConfirmed(saved);
        }

        return convertToDTO(saved);
    }

    private PoojaBookingDTO convertToDTO(PoojaBooking entity) {
        PoojaBookingDTO dto = new PoojaBookingDTO();
        BeanUtils.copyProperties(entity, dto, "createdAt", "updatedAt");
        if (entity.getCreatedAt() != null) {
            dto.setCreatedAt(entity.getCreatedAt().toString());
        }
        if (entity.getUpdatedAt() != null) {
            dto.setUpdatedAt(entity.getUpdatedAt().toString());
        }
        return dto;
    }
}
