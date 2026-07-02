package com.kumbh.repository;

import com.kumbh.entity.CrowdSector;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CrowdSectorRepository extends JpaRepository<CrowdSector, Long> {

    @Query(value = "SELECT * FROM crowd_sectors WHERE ST_Contains(boundary, ST_PointFromText(CONCAT('POINT(', :lng, ' ', :lat, ')'), 4326))", nativeQuery = true)
    CrowdSector findByLocation(@Param("lat") Double lat, @Param("lng") Double lng);

    @Query(value = "SELECT * FROM crowd_sectors WHERE ST_Distance_Sphere(ST_Centroid(boundary), ST_PointFromText(CONCAT('POINT(', :lng, ' ', :lat, ')'), 4326)) <= :radius", nativeQuery = true)
    List<CrowdSector> findNearbySectors(@Param("lat") Double lat, @Param("lng") Double lng, @Param("radius") Double radius);
}
