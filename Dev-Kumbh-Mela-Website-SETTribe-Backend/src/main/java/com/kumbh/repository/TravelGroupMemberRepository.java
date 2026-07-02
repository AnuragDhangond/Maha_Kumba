package com.kumbh.repository;

import com.kumbh.entity.TravelGroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TravelGroupMemberRepository extends JpaRepository<TravelGroupMember, Long> {

    List<TravelGroupMember> findByGroupIdAndIsDeletedFalse(Long groupId);

    Optional<TravelGroupMember> findByGroupIdAndUserIdAndIsDeletedFalse(Long groupId, Long userId);

    Optional<TravelGroupMember> findByGroupIdAndMemberPhoneAndIsDeletedFalse(Long groupId, String memberPhone);
}
