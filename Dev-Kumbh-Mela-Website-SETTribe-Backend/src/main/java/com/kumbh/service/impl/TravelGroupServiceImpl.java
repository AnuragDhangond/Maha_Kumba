package com.kumbh.service.impl;

import com.kumbh.entity.TravelGroup;
import com.kumbh.entity.TravelGroupMember;
import com.kumbh.repository.TravelGroupMemberRepository;
import com.kumbh.repository.TravelGroupRepository;
import com.kumbh.service.TravelGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@Transactional
public class TravelGroupServiceImpl implements TravelGroupService {

    @Autowired
    private TravelGroupRepository travelGroupRepository;

    @Autowired
    private TravelGroupMemberRepository memberRepository;

    @Override
    public TravelGroup createGroup(TravelGroup group, Long userId, String userName) {
        // Generate unique code
        String groupCode = generateUniqueGroupCode();
        group.setGroupCode(groupCode);
        group.setStatus("OPEN");
        group.setCreatorId(userId);
        if (userName != null && !userName.trim().isEmpty()) {
            group.setCreatorName(userName);
        } else {
            group.setCreatorName("Anonymous Pilgrim");
        }

        TravelGroup savedGroup = travelGroupRepository.save(group);

        // Add creator as the first member
        TravelGroupMember creatorMember = new TravelGroupMember();
        creatorMember.setGroupId(savedGroup.getId());
        creatorMember.setUserId(userId);
        creatorMember.setMemberName(group.getCreatorName());
        creatorMember.setMemberPhone(group.getContactNumber());
        creatorMember.setJoinedAt(LocalDateTime.now());
        memberRepository.save(creatorMember);

        savedGroup.setMembersCount(1);
        return savedGroup;
    }

    @Override
    public TravelGroupMember joinGroup(Long groupId, Long userId, String memberName, String memberPhone) {
        TravelGroup group = travelGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Travel group not found with id: " + groupId));

        if (group.getIsDeleted() != null && group.getIsDeleted()) {
            throw new RuntimeException("This travel group has been deleted.");
        }

        if ("CLOSED".equalsIgnoreCase(group.getStatus())) {
            throw new RuntimeException("This travel group is closed for new members.");
        }

        List<TravelGroupMember> currentMembers = memberRepository.findByGroupIdAndIsDeletedFalse(groupId);
        if (currentMembers.size() >= group.getMaxMembers()) {
            throw new RuntimeException("This travel group has reached its maximum capacity.");
        }

        // Check if already a member by userId (if authenticated) or phone (if guest)
        if (userId != null) {
            Optional<TravelGroupMember> existing = memberRepository.findByGroupIdAndUserIdAndIsDeletedFalse(groupId, userId);
            if (existing.isPresent()) {
                throw new RuntimeException("You are already a member of this travel group.");
            }
        } else if (memberPhone != null && !memberPhone.trim().isEmpty()) {
            Optional<TravelGroupMember> existing = memberRepository.findByGroupIdAndMemberPhoneAndIsDeletedFalse(groupId, memberPhone);
            if (existing.isPresent()) {
                throw new RuntimeException("A member with this phone number is already registered in this group.");
            }
        }

        TravelGroupMember member = new TravelGroupMember(groupId, userId, memberName, memberPhone);
        return memberRepository.save(member);
    }

    @Override
    public TravelGroupMember joinGroupByCode(String groupCode, Long userId, String memberName, String memberPhone) {
        if (groupCode == null || groupCode.trim().isEmpty()) {
            throw new RuntimeException("Group code is required.");
        }
        
        TravelGroup group = travelGroupRepository.findByGroupCode(groupCode.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Travel group not found with code: " + groupCode));

        return joinGroup(group.getId(), userId, memberName, memberPhone);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TravelGroup> searchGroups(String source, LocalDate date) {
        List<TravelGroup> groups = travelGroupRepository.searchGroups(source, date);
        for (TravelGroup g : groups) {
            g.setMembersCount(memberRepository.findByGroupIdAndIsDeletedFalse(g.getId()).size());
        }
        return groups;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TravelGroup> getAllGroups() {
        List<TravelGroup> groups = travelGroupRepository.findByIsDeletedFalseOrderByCreatedAtDesc();
        for (TravelGroup g : groups) {
            g.setMembersCount(memberRepository.findByGroupIdAndIsDeletedFalse(g.getId()).size());
        }
        return groups;
    }

    @Override
    @Transactional(readOnly = true)
    public TravelGroup getGroupById(Long id) {
        TravelGroup group = travelGroupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Travel group not found with id: " + id));
        group.setMembersCount(memberRepository.findByGroupIdAndIsDeletedFalse(id).size());
        return group;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TravelGroupMember> getGroupMembers(Long groupId) {
        return memberRepository.findByGroupIdAndIsDeletedFalse(groupId);
    }

    @Override
    public void deleteGroup(Long id) {
        TravelGroup group = travelGroupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Travel group not found with id: " + id));
        group.setIsDeleted(true);
        travelGroupRepository.save(group);

        // Also mark members as deleted
        List<TravelGroupMember> members = memberRepository.findByGroupIdAndIsDeletedFalse(id);
        for (TravelGroupMember m : members) {
            m.setIsDeleted(true);
            memberRepository.save(m);
        }
    }

    private String generateUniqueGroupCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random rnd = new Random();
        String code;
        do {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sb.append(chars.charAt(rnd.nextInt(chars.length())));
            }
            code = sb.toString();
        } while (travelGroupRepository.findByGroupCode(code).isPresent());
        return code;
    }
}
