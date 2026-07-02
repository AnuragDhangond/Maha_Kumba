package com.kumbh.service.impl;

import com.kumbh.entity.LiveUpdate;
import com.kumbh.pagination.LiveUpdatePagination;
import com.kumbh.repository.LiveUpdateRepository;
import com.kumbh.service.LiveUpdateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import java.time.LocalDateTime;

import java.util.List;

@Service
public class LiveUpdateServiceImpl implements LiveUpdateService {

    @Autowired
    private LiveUpdateRepository repository;

    @Autowired
    private LiveUpdatePagination pagination;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private void broadcastUpdates() {
        try {
            messagingTemplate.convertAndSend("/topic/updates", getAllUpdates());
        } catch (Exception e) {
            System.err.println("Failed to broadcast live updates: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public LiveUpdate createUpdate(LiveUpdate update) {
        if (update.getCreatedAt() == null) {
            update.setCreatedAt(LocalDateTime.now());
        }
        LiveUpdate saved = repository.save(update);
        broadcastUpdates();
        return saved;
    }

    @Override
    public List<LiveUpdate> getAllUpdates() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public Page<LiveUpdate> getPaginatedUpdates(String search, String category, int page, int size) {
        return repository.findWithFilters(search, category, PageRequest.of(page, size));
    }

    @Override
    public Page<com.kumbh.dto.LiveUpdateDto> getPaginatedUpdates(String search, String category, Integer page, Integer size, String sortBy, String direction) {
        return pagination.getPaginatedUpdates(search, category, page, size, sortBy, direction);
    }

    @Override
    public LiveUpdate getUpdateById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Update not found with id: " + id));
    }

    @Override
    @Transactional
    public LiveUpdate updateUpdate(Long id, LiveUpdate updateDetails) {
        LiveUpdate update = getUpdateById(id);
        update.setTitle(updateDetails.getTitle());
        update.setDescription(updateDetails.getDescription());
        update.setLocation(updateDetails.getLocation());
        update.setStartTime(updateDetails.getStartTime());
        update.setEndTime(updateDetails.getEndTime());
        update.setFeatured(updateDetails.isFeatured());
        update.setCategory(updateDetails.getCategory());
        update.setExternalLink(updateDetails.getExternalLink());
        if (updateDetails.getImagePath() != null) {
            update.setImagePath(updateDetails.getImagePath());
        }
        LiveUpdate updated = repository.save(update);
        broadcastUpdates();
        return updated;
    }

    @Override
    @Transactional
    public void deleteUpdate(Long id) {
        repository.deleteById(id);
        broadcastUpdates();
    }

    @Override
    public boolean existsByTitleAndTimeAndLocation(String title, java.time.LocalTime startTime, String location) {
        return repository.existsByTitleAndStartTimeAndLocation(title, startTime, location);
    }

    @Override
    public boolean existsByTitleAndLocation(String title, String location) {
        return repository.existsByTitleAndLocation(title, location);
    }
}
