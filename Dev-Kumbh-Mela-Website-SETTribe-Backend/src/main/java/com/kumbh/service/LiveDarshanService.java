package com.kumbh.service;

import com.kumbh.dto.LiveDarshanDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface LiveDarshanService {
    LiveDarshanDto createDarshan(LiveDarshanDto darshanDto);
    List<LiveDarshanDto> getAllDarshans();
    Page<LiveDarshanDto> getAllDarshans(String search, Integer page, Integer size, String sortBy, String direction);
    LiveDarshanDto getDarshanById(Long id);
    LiveDarshanDto updateDarshan(Long id, LiveDarshanDto darshanDto);
    void deleteDarshan(Long id);
}
