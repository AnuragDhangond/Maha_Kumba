package com.kumbh.repository;

import com.kumbh.entity.PoojaItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PoojaItemRepository extends JpaRepository<PoojaItem, Long> {
    List<PoojaItem> findByAcharyaIdAndIsActiveTrue(Long acharyaId);
    List<PoojaItem> findByAcharyaId(Long acharyaId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    void deleteByAcharyaId(Long acharyaId);
}
