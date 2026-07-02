package com.kumbh.service;

import com.kumbh.entity.TravelGroup;
import com.kumbh.entity.TravelGroupMember;

import java.time.LocalDate;
import java.util.List;

public interface TravelGroupService {

    TravelGroup createGroup(TravelGroup group, Long userId, String userName);

    TravelGroupMember joinGroup(Long groupId, Long userId, String memberName, String memberPhone);

    TravelGroupMember joinGroupByCode(String groupCode, Long userId, String memberName, String memberPhone);

    List<TravelGroup> searchGroups(String source, LocalDate date);

    List<TravelGroup> getAllGroups();

    TravelGroup getGroupById(Long id);

    List<TravelGroupMember> getGroupMembers(Long groupId);

    void deleteGroup(Long id);
}
