package com.kumbh.service;

import com.kumbh.entity.LiveUpdate;
import org.springframework.data.domain.Page;
import java.util.List;

public interface LiveUpdateService {
    LiveUpdate createUpdate(LiveUpdate update);
    List<LiveUpdate> getAllUpdates();
    Page<LiveUpdate> getPaginatedUpdates(String search, String category, int page, int size);
    Page<com.kumbh.dto.LiveUpdateDto> getPaginatedUpdates(String search, String category, Integer page, Integer size, String sortBy, String direction);
    LiveUpdate getUpdateById(Long id);
    LiveUpdate updateUpdate(Long id, LiveUpdate updateDetails);
    void deleteUpdate(Long id);
    boolean existsByTitleAndTimeAndLocation(String title, java.time.LocalTime startTime, String location);
    boolean existsByTitleAndLocation(String title, String location);
}
