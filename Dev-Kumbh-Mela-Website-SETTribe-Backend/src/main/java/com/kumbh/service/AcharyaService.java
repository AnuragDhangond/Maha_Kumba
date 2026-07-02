package com.kumbh.service;

import com.kumbh.dto.AcharyaDTO;
import com.kumbh.dto.PoojaItemDTO;
import com.kumbh.entity.Acharya;
import com.kumbh.entity.PoojaItem;
import com.kumbh.pagination.AcharyaPagination;
import com.kumbh.repository.AcharyaRepository;
import com.kumbh.repository.PoojaItemRepository;
import com.kumbh.repository.PoojaBookingRepository;
import com.kumbh.util.Mapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AcharyaService {

    private static final Logger logger = LoggerFactory.getLogger(AcharyaService.class);

    @Autowired
    private AcharyaRepository repository;

    @Autowired
    private PoojaItemRepository poojaItemRepository;

    @Autowired
    private PoojaBookingRepository bookingRepository;

    @Autowired
    private AcharyaPagination pagination;

    public Page<AcharyaDTO> getAllAcharyas(String search, Integer page, Integer size, String sortBy, String direction) {
        return pagination.getPaginatedAcharyas(search, page, size, sortBy, direction);
    }

    @Transactional
    public AcharyaDTO createAcharya(AcharyaDTO dto) {
        logger.info("Creating new Acharya: {}", dto.getName());
        try {
            Acharya entity = Mapper.toEntity(dto);
            Acharya saved = repository.save(entity);

            if (dto.getPoojas() != null) {
                for (PoojaItemDTO pDto : dto.getPoojas()) {
                    PoojaItem pEntity = Mapper.toEntity(pDto);
                    pEntity.setAcharyaId(saved.getId());
                    pEntity.setActive(true);
                    poojaItemRepository.save(pEntity);
                }
            }
            
            logger.info("Successfully created Acharya with id: {}", saved.getId());
            return convertToDTO(saved);
        } catch (Exception e) {
            logger.error("Error creating Acharya: {}", dto.getName(), e);
            throw new RuntimeException("Could not create Acharya: " + e.getMessage());
        }
    }

    @Transactional
    public AcharyaDTO updateAcharya(Long id, AcharyaDTO dto) {
        logger.info("Updating Acharya with id: {}", id);
        try {
            Acharya entity = repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Acharya not found with id: " + id));
            
            // 1. Update Acharya Basic Info
            entity.setName(dto.getName());
            entity.setSpecialty(dto.getSpecialty());
            entity.setExperience(dto.getExperience());
            entity.setRating(dto.getRating() != null ? dto.getRating() : entity.getRating());
            entity.setReviews(dto.getReviews() != null ? dto.getReviews() : entity.getReviews());
            entity.setImagePath(dto.getImagePath() != null ? dto.getImagePath() : entity.getImagePath());
            entity.setLocation(dto.getLocation());
            Acharya updated = repository.save(entity);
            
            // 2. Smart Update Rituals (Soft Delete approach)
            List<PoojaItem> existingRituals = poojaItemRepository.findByAcharyaIdAndIsActiveTrue(id);
            Map<String, PoojaItem> ritualMap = existingRituals.stream()
                    .collect(Collectors.toMap(PoojaItem::getName, p -> p, (p1, p2) -> p1));

            List<PoojaItemDTO> newRitualsDto = dto.getPoojas() != null ? dto.getPoojas() : List.of();
            Set<String> incomingNames = newRitualsDto.stream().map(PoojaItemDTO::getName).collect(Collectors.toSet());

            // A. Process incoming rituals (Add or Update)
            for (PoojaItemDTO pDto : newRitualsDto) {
                PoojaItem ritual = ritualMap.get(pDto.getName());
                if (ritual != null) {
                    // Update existing
                    ritual.setPrice(pDto.getPrice());
                    ritual.setDuration(pDto.getDuration());
                    poojaItemRepository.save(ritual);
                } else {
                    // Check if there's an inactive one with same name to reactivate
                    // Otherwise create new
                    PoojaItem newRitual = Mapper.toEntity(pDto);
                    newRitual.setAcharyaId(id);
                    newRitual.setActive(true);
                    poojaItemRepository.save(newRitual);
                }
            }

            // B. Process removed rituals (Soft Delete or Hard Delete)
            for (PoojaItem oldRitual : existingRituals) {
                if (!incomingNames.contains(oldRitual.getName())) {
                    if (bookingRepository.existsByPoojaId(oldRitual.getId())) {
                        // Ritual has bookings: Soft Delete
                        oldRitual.setActive(false);
                        poojaItemRepository.save(oldRitual);
                        logger.info("Soft-deleted ritual '{}' (ID: {}) as it has bookings.", oldRitual.getName(), oldRitual.getId());
                    } else {
                        // Ritual has no bookings: Hard Delete
                        poojaItemRepository.delete(oldRitual);
                        logger.info("Hard-deleted ritual '{}' (ID: {}) as it has no bookings.", oldRitual.getName(), oldRitual.getId());
                    }
                }
            }
            
            logger.info("Successfully updated Acharya with id: {}", id);
            return convertToDTO(updated);
        } catch (Exception e) {
            logger.error("Error updating Acharya with id: {}", id, e);
            throw new RuntimeException("Could not update Acharya: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteAcharya(Long id) {
        logger.info("Deleting Acharya with id: {}", id);
        try {
            // Soft delete all rituals first
            List<PoojaItem> rituals = poojaItemRepository.findByAcharyaId(id);
            for (PoojaItem ritual : rituals) {
                if (bookingRepository.existsByPoojaId(ritual.getId())) {
                    ritual.setActive(false);
                    poojaItemRepository.save(ritual);
                } else {
                    poojaItemRepository.delete(ritual);
                }
            }
            repository.deleteById(id);
            logger.info("Successfully deleted Acharya with id: {}", id);
        } catch (Exception e) {
            logger.error("Error deleting Acharya with id: {}", id, e);
            throw new RuntimeException("Could not delete Acharya: " + e.getMessage());
        }
    }

    private AcharyaDTO convertToDTO(Acharya entity) {
        // Only return ACTIVE rituals in the DTO
        List<PoojaItem> poojas = poojaItemRepository.findByAcharyaIdAndIsActiveTrue(entity.getId());
        return Mapper.toDto(entity, poojas);
    }
}
