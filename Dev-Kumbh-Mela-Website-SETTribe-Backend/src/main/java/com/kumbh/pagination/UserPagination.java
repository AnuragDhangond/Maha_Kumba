package com.kumbh.pagination;

import com.kumbh.dto.UserDto;
import com.kumbh.entity.User;
import com.kumbh.mapper.EntityDtoMapper;
import com.kumbh.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
public class UserPagination {

    @Autowired
    private UserRepository repository;

    public Page<UserDto> getPaginatedUsers(String search, Integer page, Integer size, String sortBy, String direction) {
        // 1. Set Defaults internally
        int pageNum = (page == null) ? 0 : page;
        int pageSize = (size == null) ? 10 : size;
        String sortKey = (sortBy == null || sortBy.isBlank()) ? "id" : sortBy;
        String sortDir = (direction == null || direction.isBlank()) ? "desc" : direction;

        // 2. Build the Sort and Pageable objects
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortKey).descending() : Sort.by(sortKey).ascending();
        Pageable pageable = PageRequest.of(pageNum, pageSize, sort);

        // 3. Database Query
        Page<User> userPage;
        if (search != null && !search.trim().isEmpty()) {
            userPage = repository.searchUsers(search.trim(), pageable);
        } else {
            userPage = repository.findAll(pageable);
        }

        // 4. Convert to DTO
        return userPage.map(EntityDtoMapper::toUserDto);
    }
}
