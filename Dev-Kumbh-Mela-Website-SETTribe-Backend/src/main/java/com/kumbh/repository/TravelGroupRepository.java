package com.kumbh.repository;

import com.kumbh.entity.TravelGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TravelGroupRepository extends JpaRepository<TravelGroup, Long> {
    
    Optional<TravelGroup> findByGroupCode(String groupCode);

    List<TravelGroup> findByIsDeletedFalseOrderByCreatedAtDesc();

    @Query("SELECT t FROM TravelGroup t WHERE t.isDeleted = false " +
           "AND (:source IS NULL OR t.sourceLocation ILIKE CONCAT('%', :source, '%')) " +
           "AND (:date IS NULL OR t.travelDate = :date) " +
           "ORDER BY t.createdAt DESC")
    List<TravelGroup> searchGroups(@Param("source") String source, @Param("date") LocalDate date);
}
