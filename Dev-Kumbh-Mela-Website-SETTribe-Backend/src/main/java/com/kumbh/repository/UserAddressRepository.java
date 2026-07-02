package com.kumbh.repository;

import com.kumbh.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface UserAddressRepository extends JpaRepository<UserAddress, Integer> {

    List<UserAddress> findByUserIdAndIsDeletedFalse(Integer userId);

    Optional<UserAddress> findByIdAndUserIdAndIsDeletedFalse(Integer id, Integer userId);

    @Modifying
    @Transactional
    @Query("UPDATE UserAddress ua SET ua.isDefault = false WHERE ua.user.id = :userId AND ua.isDeleted = false")
    void clearDefaultAddresses(@Param("userId") Integer userId);
}
