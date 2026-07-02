package com.kumbh.service;

import com.kumbh.dto.StayDto;
import com.kumbh.entity.Stay;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface StayService {
    Stay createStay(Stay stay);
    Page<Stay> getAllStays(Pageable pageable, String search);
    Page<StayDto> getPaginatedStays(String search, Integer page, Integer size, String sortBy, String direction);
    Stay getStayById(Long id);
    Stay updateStay(Long id, Stay stayDetails);
    void deleteStay(Long id);
    List<Stay> getStaysByCategory(String category);
    boolean existsByTitleAndCategoryAndPrice(String title, com.kumbh.entity.StayCategory category, Long price);
}
