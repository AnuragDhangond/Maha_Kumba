package com.kumbh.service.impl;

import com.kumbh.dto.StayDto;
import com.kumbh.entity.Stay;
import com.kumbh.entity.StayCategory;
import com.kumbh.pagination.StayPagination;
import com.kumbh.repository.StayRepository;
import com.kumbh.service.StayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StayServiceImpl implements StayService {

    @Autowired
    private StayRepository repository;

    @Autowired
    private StayPagination pagination;

    @Override
    public Stay createStay(Stay stay) {
        validateStay(stay);
        if (existsByTitleAndCategoryAndPrice(stay.getTitle(), stay.getCategory(), stay.getPrice())) {
            throw new RuntimeException("A stay with this title, category and price already exists.");
        }
        return repository.save(stay);
    }

    @Override
    public Page<Stay> getAllStays(Pageable pageable, String search) {
        if (search != null && !search.isEmpty()) {
            return repository.searchStays(search, pageable);
        }
        return repository.findAll(pageable);
    }

    @Override
    public Page<StayDto> getPaginatedStays(String search, Integer page, Integer size, String sortBy, String direction) {
        return pagination.getPaginatedStays(search, page, size, sortBy, direction);
    }

    @Override
    public Stay getStayById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Stay not found with id: " + id));
    }

    @Override
    public Stay updateStay(Long id, Stay stayDetails) {
        Stay stay = getStayById(id);
        validateStay(stayDetails);
        
        stay.setTitle(stayDetails.getTitle());
        stay.setCategory(stayDetails.getCategory());
        stay.setRating(stayDetails.getRating());
        stay.setPrice(stayDetails.getPrice());
        stay.setFeatures(stayDetails.getFeatures());

        if (stayDetails.getImagePath() != null) {
            stay.setImagePath(stayDetails.getImagePath());
        } else if (stayDetails.isRemoveImage()) {
            stay.setImagePath(null);
        }

        return repository.save(stay);
    }

    @Override
    public void deleteStay(Long id) {
        repository.deleteById(id);
    }

    @Override
    public List<Stay> getStaysByCategory(String category) {
        return repository.findByCategory(category);
    }

    @Override
    public boolean existsByTitleAndCategoryAndPrice(String title, StayCategory category, Long price) {
        return repository.existsByTitleAndCategoryAndPrice(title, category, price);
    }

    private void validateStay(Stay stay) {
        if (stay.getRating() == null || stay.getRating() < 0 || stay.getRating() > 5) {
            throw new RuntimeException("Rating must be between 0 and 5");
        }

        if (stay.getCategory() == StayCategory.LUXURY_TENTS && stay.getPrice() < 1000) {
            throw new RuntimeException("Price for Luxury Tents should be at least ₹1000");
        }
        
        if (stay.getCategory() == StayCategory.PREMIUM_HOTELS && stay.getRating() < 3.0) {
            throw new RuntimeException("Premium Hotels should usually have a rating of at least 3.0");
        }
    }
}
