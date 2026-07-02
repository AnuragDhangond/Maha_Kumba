package com.kumbh.repository;

import com.kumbh.entity.SpiritualPlace;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpiritualPlaceRepository extends JpaRepository<SpiritualPlace, Long> {
    List<SpiritualPlace> findByStatusOrderByDisplayOrderAsc(String status);

    Page<SpiritualPlace> findByPlaceNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String placeName, String description, Pageable pageable);
}
